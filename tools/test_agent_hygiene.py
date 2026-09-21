"""Behavior and safety checks using only test-owned temporary resources."""
import contextlib
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

import agent_hygiene as hygiene


class HygieneTests(unittest.TestCase):
    def setUp(self):
        base = Path(__file__).resolve().parents[1] / '.agent' / 'tmp'
        base.mkdir(parents=True, exist_ok=True)
        self.temp = tempfile.TemporaryDirectory(prefix='hygiene-test-', dir=base)
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name).resolve()
        self.rid = 'test-run'
        self.scratch = self.root / '.agent' / 'tmp' / self.rid
        self.scratch.mkdir(parents=True)

    def resource(self, path):
        return {'type': 'temp_path', 'path': str(path), 'run_id': self.rid,
                'created_by': 'agent_hygiene.temp', 'cleanup_status': 'pending'}

    def test_cleanup_preserves_unrelated_file(self):
        owned = self.scratch / 'owned.txt'
        owned.write_text('scratch')
        unrelated = self.root / 'user.txt'
        unrelated.write_text('keep')
        self.assertEqual(hygiene.cleanup_temp_path(self.root, self.rid, self.resource(owned))[0], 'clean')
        self.assertFalse(owned.exists())
        self.assertEqual(unrelated.read_text(), 'keep')

    def test_cleanup_refuses_outside_path(self):
        outside = self.root / 'user.txt'
        outside.write_text('keep')
        self.assertEqual(hygiene.cleanup_temp_path(self.root, self.rid, self.resource(outside))[0], 'review')
        self.assertTrue(outside.exists())

    def test_cleanup_refuses_unowned_path(self):
        resource = self.resource(self.scratch)
        resource['run_id'] = 'another-run'
        self.assertEqual(hygiene.cleanup_temp_path(self.root, self.rid, resource)[0], 'review')
        self.assertTrue(self.scratch.exists())

    def test_invalid_run_id_rejected(self):
        for rid in ('../user', '..', '/tmp', 'C:\\user', 'a/b'):
            with self.subTest(rid=rid), self.assertRaises(SystemExit):
                hygiene.run_dir(self.root, rid)

    def test_mismatched_manifest_rejected(self):
        hygiene.save_manifest(self.root, {'run_id': self.rid})
        p = hygiene.manifest_path(self.root, self.rid)
        p.write_text(json.dumps({'run_id': 'another-run'}))
        with self.assertRaises(SystemExit):
            hygiene.load_manifest(self.root, self.rid)

    def test_closed_run_rejects_new_resources(self):
        with self.assertRaises(SystemExit):
            hygiene.require_active({'status': 'ended'})

    def test_process_probe_does_not_terminate(self):
        proc = subprocess.Popen([sys.executable, '-c', 'import time; time.sleep(15)'],
                                creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0)
        try:
            self.assertTrue(hygiene.process_alive(proc.pid))
            self.assertIsNone(proc.poll())
        finally:
            proc.terminate()  # this test owns the live Popen handle
            proc.wait(timeout=5)
        self.assertFalse(hygiene.process_alive(proc.pid))

    def test_missing_process_identity_never_killed(self):
        resource = {'pid': 123, 'created_by': 'agent_hygiene.spawn'}
        with patch.object(hygiene, 'process_alive', return_value=True), \
             patch.object(hygiene, 'cmd_signature', return_value=None), \
             patch.object(hygiene.os, 'kill') as kill:
            self.assertEqual(hygiene.cleanup_process(resource)[0], 'review')
            kill.assert_not_called()

    def test_reused_pid_refused(self):
        resource = {'pid': 123, 'cmd_signature': 'python app.py', 'process_birth': 'original'}
        with patch.object(hygiene, 'process_alive', return_value=True), \
             patch.object(hygiene, 'cmd_signature', return_value='python app.py'), \
             patch.object(hygiene, 'process_birth', return_value='replacement'), \
             patch.object(hygiene.os, 'name', 'posix'):
            self.assertFalse(hygiene.process_matches(resource)[0])

    def test_verified_linux_identity_accepted(self):
        resource = {'pid': 123, 'cmd_signature': 'python app.py', 'process_birth': 'original'}
        with patch.object(hygiene, 'process_alive', return_value=True), \
             patch.object(hygiene, 'cmd_signature', return_value='python app.py'), \
             patch.object(hygiene, 'process_birth', return_value='original'), \
             patch.object(hygiene.os, 'name', 'posix'):
            self.assertTrue(hygiene.process_matches(resource)[0])

    def test_changed_command_refused(self):
        resource = {'pid': 123, 'cmd_signature': 'python original.py', 'process_birth': 'original'}
        with patch.object(hygiene, 'process_alive', return_value=True), \
             patch.object(hygiene, 'cmd_signature', return_value='python unrelated.py'), \
             patch.object(hygiene, 'process_birth', return_value='original'), \
             patch.object(hygiene.os, 'name', 'posix'):
            self.assertFalse(hygiene.process_matches(resource)[0])

    def test_container_label_mismatch_refused(self):
        with patch.object(hygiene, 'inspect_container', return_value=(True, 'ok', 'other')), \
             patch.object(hygiene, 'run_cmd') as command:
            result = hygiene.cleanup_container({'container_id': 'test', 'run_id': self.rid})
            self.assertEqual(result[0], 'review')
            command.assert_not_called()

    def test_cleanup_reverse_order(self):
        manifest = {'run_id': self.rid, 'resources': [self.resource('first'), self.resource('second')]}
        seen = []
        def dispose(root, rid, resource):
            seen.append(resource['path'])
            return 'clean', 'test'
        with patch.object(hygiene, 'cleanup_temp_path', side_effect=dispose):
            hygiene.cleanup_resources(self.root, manifest)
        self.assertEqual(seen, ['second', 'first'])

    def test_prune_retains_unresolved_manifest(self):
        manifest = {'run_id': self.rid, 'status': 'ended', 'ended_at': '2000-01-01T00:00:00+00:00',
                    'resources': [{'cleanup_status': 'review'}]}
        hygiene.save_manifest(self.root, manifest)
        args = hygiene.build_parser().parse_args(['--root', str(self.root), 'prune', '--apply'])
        with patch.object(hygiene, 'project_root', return_value=self.root), contextlib.redirect_stdout(io.StringIO()):
            hygiene.cmd_prune(args)
        self.assertTrue(hygiene.manifest_path(self.root, self.rid).exists())

    def test_cli_lifecycle_and_dry_run(self):
        subprocess.run(['git', 'init', '--quiet', str(self.root)], check=True)
        script = Path(hygiene.__file__).resolve()
        def cli(*args, check=True):
            return subprocess.run([sys.executable, '-X', 'utf8', str(script), '--root', str(self.root), *args],
                                  text=True, capture_output=True, check=check)
        unrelated = self.root / 'user.txt'
        unrelated.write_text('keep')
        rid = cli('start', '--task', 'smoke test').stdout.splitlines()[0]
        self.assertNotEqual(cli('start', '--task', 'collision', check=False).returncode, 0)
        owned = Path(cli('temp', '--name', 'smoke').stdout.strip())
        self.assertTrue(owned.is_dir())
        cli('reap', '--older-than-hours', '0')
        self.assertTrue(owned.is_dir())
        self.assertNotEqual(cli('promote', str(owned), '--reason', 'invalid', check=False).returncode, 0)
        cli('end', '--summary', 'verified')
        self.assertFalse(owned.exists())
        self.assertFalse((self.root / '.agent/current').exists())
        self.assertEqual(unrelated.read_text(), 'keep')
        self.assertTrue(all(r['cleanup_status'] == 'clean' for r in hygiene.load_manifest(self.root, rid)['resources']))


if __name__ == '__main__':
    unittest.main()

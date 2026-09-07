/* Regression checks use the same player renderers as the embedded preview. */
window.NGChecks = function (check, a) {
  const D = NGDesign;
  const baseline = () => {
    a.loadScene("live-ng");
    a.state.preview.page = "首页";
    a.state.draft.theme.extra = {};
  };
  check("37. 37 Figma variants render in all three source palettes", () => {
    baseline();
    return NGStudio.testPlayer((t) => {
      for (const color of ["BDOK", "橙白", "藍白"])
        for (const [id, f] of Object.entries(D.families))
          for (let n = 1; n <= f.titles.length; n++) {
            const c = D.clone(t.config);
            c.color = color;
            c.styles[f.key] = n;
            c.values.sidebar = "左方";
            c.values.sidebarDisabled = false;
            c.focus = id;
            t.player.setConfig(c);
            if (f.key === "shortcuts") {
              t.player.local.quick = true;
              t.player.render();
            }
            const selectors = {
              header: ".p-header-",
              sidebar: ".p-sidebar-",
              shortcuts: ".p-floating-",
              grid: ".p-grid-",
              search: ".p-search-",
              carousel: ".p-carousel-",
              download: ".p-download-",
              category: ".p-categories-",
            };
            if (f.key === "category" && n === 3) {
              if (t.root.querySelector(".p-categories")) return false;
            } else if (!t.root.querySelector(selectors[f.key] + n))
              throw new Error(f.key + " " + n + " / " + color);
            if (
              f.key === "category" &&
              n === 2 &&
              t.root.querySelector(".p-category-list").clientWidth < 180
            )
              throw new Error("Category carousel has collapsed");
          }
      return true;
    });
  });
  check(
    "38. Component changes preserve unrelated DOM and browsing state",
    () => {
      baseline();
      return NGStudio.testPlayer((t) => {
        const header = t.root.querySelector(".p-header"),
          banner = t.root.querySelector(".p-carousel"),
          bottom = t.root.querySelector(".p-bottom");
        const input = t.root.querySelector("input[type=search]");
        input.value = "Medusa";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        const c = D.clone(t.config);
        c.styles.grid = 2;
        t.player.setConfig(c);
        return (
          header === t.root.querySelector(".p-header") &&
          banner === t.root.querySelector(".p-carousel") &&
          bottom === t.root.querySelector(".p-bottom") &&
          input === t.root.querySelector("input[type=search]") &&
          t.player.local.query === "Medusa" &&
          [...t.root.querySelectorAll(".p-game-card")].every((n) =>
            n.getAttribute("aria-label").includes("Medusa"),
          )
        );
      });
    },
  );
  check(
    "39. Palette switches use shared tokens without rebuilding header",
    () => {
      baseline();
      return NGStudio.testPlayer((t) => {
        const h = t.root.querySelector(".p-header");
        return ["橙白", "藍白", "BDOK"].every((color) => {
          const c = D.clone(t.config);
          c.color = color;
          t.player.setConfig(c);
          return (
            t.root.style.getPropertyValue("--p-accent") ===
              D.palette(color).accent &&
            t.root.style.getPropertyValue("--p-bg") === D.palette(color).bg &&
            t.root.querySelector(".p-header") === h
          );
        });
      });
    },
  );
  check("40. One theme and two allowed colors are enforced for players", () => {
    baseline();
    return NGStudio.testPlayer((t) => {
      const c = D.clone(t.config);
      c.page = "设置";
      c.policy = D.defaultPolicy();
      c.policy.colors.NG = ["BDOK", "藍白"];
      t.player.setConfig(c);
      const choices = [
        ...t.root.querySelectorAll('[data-p="player-color"]'),
      ].map((n) => n.dataset.color);
      t.player.playerChoice({ theme: "WG" });
      const locked = t.player.current().theme === "NG";
      t.player.playerChoice({ color: "橙白" });
      const blocked = t.player.current().color === "BDOK";
      t.player.playerChoice({ color: "藍白" });
      return (
        !t.root.querySelector("[data-player-theme]") &&
        choices.join(",") === "BDOK,藍白" &&
        locked &&
        blocked &&
        t.player.current().color === "藍白"
      );
    });
  });
  check(
    "41. Theme changes select that theme’s configured default color",
    () => {
      baseline();
      return NGStudio.testPlayer((t) => {
        const c = D.clone(t.config);
        c.page = "设置";
        c.policy = D.defaultPolicy();
        c.policy.themes = ["NG", "WG"];
        t.player.setConfig(c);
        const count = t.root.querySelector("[data-player-theme]").options
          .length;
        t.player.playerChoice({ theme: "WG" });
        return (
          count === 2 &&
          t.player.current().theme === "WG" &&
          t.player.current().color === "BDAK" &&
          !t.root.querySelector('[data-p="player-color"]')
        );
      });
    },
  );
  check(
    "42. Saving and cancelling include visual variants and player choices",
    () => {
      baseline();
      const p = D.defaultPolicy();
      p.colors.NG = ["BDOK", "藍白"];
      a.state.draft.theme.extra.playerChoices = p;
      a.state.draft.topStatusBar.extra.design = {
        mode: "SET",
        value: 5,
        sourceTheme: "NG",
      };
      if (!a.applyDraft(true)) return false;
      a.state.draft.theme.extra.playerChoices.colors.NG.push("橙白");
      a.state.draft.topStatusBar.extra.design.value = 2;
      a.cancelDraft();
      return (
        a.state.draft.topStatusBar.extra.design.value === 5 &&
        a.state.draft.theme.extra.playerChoices.colors.NG.join(",") ===
          "BDOK,藍白"
      );
    },
  );
  check(
    "43. Search and provider filters combine on synthetic game data",
    () => {
      baseline();
      return NGStudio.testPlayer((t) => {
        const input = t.root.querySelector("input[type=search]");
        input.value = "Medusa";
        input.dispatchEvent(new Event("input", { bubbles: true }));
        const before = t.root.querySelectorAll(".p-game-card").length;
        t.root.querySelector('[data-provider="EVO"]').click();
        const after = t.root.querySelectorAll(".p-game-card").length;
        return (
          before === 5 &&
          after === 1 &&
          t.root.querySelector(".p-game-card").getAttribute("aria-label") ===
            "Rising Medusa"
        );
      });
    },
  );
  check(
    "44. Selecting a hidden sidebar style opens only the sidebar region",
    () => {
      baseline();
      return NGStudio.testPlayer((t) => {
        const c = D.clone(t.config);
        c.focus = "sidebar";
        t.player.setConfig(c);
        const h = t.root.querySelector(".p-carousel");
        const next = D.clone(c);
        next.values.sidebar = "左方";
        next.values.sidebarDisabled = false;
        next.styles.sidebar = 5;
        t.player.setConfig(next);
        return (
          !!t.root.querySelector(".p-sidebar-5") &&
          t.root.querySelector(".p-carousel") === h
        );
      });
    },
  );
  check("45. Dismissing filter drafts does not apply them", () => {
    baseline();
    return NGStudio.testPlayer((t) => {
      const c = D.clone(t.config);
      c.styles.search = 4;
      t.player.setConfig(c);
      t.root.querySelector('[data-p="filter"]').click();
      t.root
        .querySelector('[data-p="draft-provider"][data-provider="EVO"]')
        .click();
      t.root.querySelector('[data-p="close-filter"]').click();
      return (
        !t.player.local.providers.length &&
        !t.root.querySelector(".p-filter-panel")
      );
    });
  });
  check(
    "46. Invalid player restrictions and style indices block saving",
    () => {
      baseline();
      a.state.draft.theme.extra.playerChoices = {
        themes: ["NG"],
        colors: { NG: [] },
        defaults: { NG: "BDOK" },
      };
      const blocked = !a.resolveAll().canApply;
      a.state.draft.theme.extra = {};
      a.state.draft.topStatusBar.extra.design = {
        mode: "SET",
        value: 9,
        sourceTheme: "NG",
      };
      return blocked && !a.resolveAll().canApply;
    },
  );
  check(
    "47. Tenant switches isolate player policies and component styles",
    () => {
      baseline();
      const first = a.state.tenantId,
        other = first === "tenant-a" ? "tenant-b" : "tenant-a";
      a.state.draft.theme.extra.playerChoices = D.defaultPolicy();
      a.state.draft.theme.extra.playerChoices.colors.NG = ["BDOK"];
      a.state.draft.topStatusBar.extra.design = {
        mode: "SET",
        value: 4,
        sourceTheme: "NG",
      };
      a.tenantStores[first] = a.snapshotState();
      a.switchTenant(other);
      const isolated =
        JSON.stringify(a.state.draft.theme.extra) !==
        JSON.stringify(a.tenantStores[first].draft.theme.extra);
      a.switchTenant(first);
      return (
        isolated &&
        a.state.draft.theme.extra.playerChoices.colors.NG.length === 1 &&
        a.state.draft.topStatusBar.extra.design.value === 4
      );
    },
  );
  check(
    "48. Card density changes size while keeping category selection",
    () => {
      baseline();
      return NGStudio.testPlayer((t) => {
        const c = D.clone(t.config);
        c.styles.grid = 3;
        t.player.setConfig(c);
        t.root.querySelector('[data-density="2"][data-p]').click();
        const w = t.root
          .querySelector(".p-game-card")
          .getBoundingClientRect().width;
        t.root.querySelector('[data-density="4"][data-p]').click();
        const small = t.root
          .querySelector(".p-game-card")
          .getBoundingClientRect().width;
        return w > small * 1.5 && t.player.local.category === "ALL";
      });
    },
  );
  check("49. Signed-out protected pages contain no account balances", () => {
    baseline();
    return NGStudio.testPlayer((t) =>
      [
        "账户",
        "我的",
        "钱包",
        "充值",
        "提款",
        "用户验证",
        "站内信",
        "VIP",
      ].every((page) => {
        const c = D.clone(t.config);
        c.auth = "loggedOut";
        c.page = page;
        t.player.setConfig(c);
        return (
          !t.root.querySelector("[data-balance]") &&
          !t.root.querySelector(".p-vip-card") &&
          !t.root.querySelector(".p-payment")
        );
      }),
    );
  });

  check("50. Download OFF hides both bar and derived floating entry", () => {
    baseline();
    return NGStudio.testPlayer((t) => {
      const c = D.clone(t.config);
      c.values.topDownloadBar = null;
      c.values.downloadFAB = null;
      t.player.setConfig(c);
      return (
        !t.root.querySelector(".p-download") &&
        !t.root.querySelector(".p-download-fab")
      );
    });
  });
  check("51. Hiding an open sidebar restores preview interaction", () => {
    baseline();
    return NGStudio.testPlayer((t) => {
      const c = D.clone(t.config);
      c.focus = "sidebar";
      c.values.sidebar = "左方";
      c.values.sidebarDisabled = false;
      t.player.setConfig(c);
      const next = D.clone(c);
      next.values.sidebar = "关闭";
      next.values.sidebarDisabled = true;
      t.player.setConfig(next);
      return (
        !t.root.querySelector(".p-sidebar") &&
        !t.root.querySelector(".p-scroll").inert
      );
    });
  });
  check(
    "52. Compact sidebar rail expands when its active category is clicked",
    () => {
      baseline();
      return NGStudio.testPlayer((t) => {
        const c = D.clone(t.config);
        c.focus = "sidebar";
        c.styles.sidebar = 3;
        c.values.sidebar = "左方";
        c.values.sidebarDisabled = false;
        t.player.setConfig(c);
        const collapsed = !!t.root.querySelector(".p-sidebar-3.p-collapsed");
        t.root
          .querySelector('[data-p="sidebar-group"][data-group="games"]')
          .click();
        return collapsed && !t.root.querySelector(".p-sidebar-3.p-collapsed");
      });
    },
  );
  check(
    "53. Alternate entry respects auth scope and configured destination",
    () => {
      baseline();
      return NGStudio.testPlayer((t) => {
        const c = D.clone(t.config);
        c.values.alternateDisabled = false;
        c.values.alternateSpec = {
          placement: "浮动收折",
          target: "取款",
          authScope: "loggedIn",
        };
        t.player.setConfig(c);
        const entry = t.root.querySelector(".p-alternate-entry"),
          valid = entry && entry.dataset.page === "提款";
        const next = D.clone(c);
        next.auth = "loggedOut";
        t.player.setConfig(next);
        return valid && !t.root.querySelector(".p-alternate-entry");
      });
    },
  );
  check("54. 页面组件 21 款样式在三色与三种 H5 宽度可用", () => {
    baseline();
    return NGStudio.testPlayer((t) => {
      for (const width of [320, 390, 480])
        for (const color of ["BDOK", "橙白", "藍白"])
          for (const [id, f] of Object.entries(D.pageFamilies))
            for (let n = 1; n <= f.titles.length; n++) {
              t.root.style.width = width + "px";
              const c = D.clone(t.config);
              c.page = f.page;
              c.color = color;
              c.auth = "loggedIn";
              c.styles[f.key] = n;
              c.content = "normal";
              t.player.setConfig(c);
              const region = t.root.querySelector(
                f.key === "bottom"
                  ? ".pp-bottom-" + n
                  : '[data-page-variant="' + f.key + "-" + n + '"]',
              );
              if (!region || region.scrollWidth > region.clientWidth + 2)
                throw Error(id + " / " + n + " / " + color + " / " + width);
            }
      return true;
    });
  });
  check("55. 配色与其他样式保留当前充值输入及共享顶栏", () => {
    baseline();
    return NGStudio.testPlayer((t) => {
      const c = D.clone(t.config);
      c.page = "充值";
      c.styles.deposit = 2;
      t.player.setConfig(c);
      const input = t.root.querySelector('[data-page-field="amount"]'),
        header = t.root.querySelector(".p-header");
      input.value = "1234";
      input.dispatchEvent(new Event("input", { bubbles: true }));
      c.color = "藍白";
      c.styles.vip = 3;
      t.player.setConfig(c);
      return (
        input === t.root.querySelector('[data-page-field="amount"]') &&
        input.value === "1234" &&
        header === t.root.querySelector(".p-header")
      );
    });
  });
  check("56. 充值快捷金额、渠道与记录页可交互", () => {
    baseline();
    return NGStudio.testPlayer((t) => {
      const c = D.clone(t.config);
      c.page = "充值";
      t.player.setConfig(c);
      t.root.querySelector('[data-p="pp-amount"][data-amount="500"]').click();
      t.root.querySelector('[data-p="pp-method"][data-index="1"]').click();
      if (t.root.querySelector('[data-page-field="amount"]').value !== "500")
        return false;
      const channel = t.root.querySelector('[data-page-field="channel"]');
      channel.value = "2";
      channel.dispatchEvent(new Event("input", { bubbles: true }));
      c.styles.deposit = 3;
      t.player.setConfig(c);
      if (t.root.querySelector('[data-page-field="channel"]').value !== "2")
        return false;
      t.root.querySelector('[data-p="pp-wallet-tab"][data-index="2"]').click();
      return (
        !!t.root.querySelector(".pp-record") &&
        !t.root.querySelector('[data-page-field="amount"]')
      );
    });
  });
  check("57. 登录方式与注册表单保留必要输入", () => {
    baseline();
    return NGStudio.testPlayer((t) => {
      const c = D.clone(t.config);
      c.page = "登入注册";
      t.player.setConfig(c);
      t.root.querySelector('[data-p="pp-auth-method"][data-index="1"]').click();
      if (!t.root.textContent.includes("验证码")) return false;
      t.root.querySelector('[data-p="pp-auth-tab"][data-index="1"]').click();
      return (
        t.root.querySelectorAll(".pp-auth input[type=password]").length === 2 &&
        !!t.root.querySelector(".pp-agree")
      );
    });
  });
  check("58. VIP 等级切换与个人中心隐藏规则保持独立", () => {
    baseline();
    return NGStudio.testPlayer((t) => {
      const c = D.clone(t.config);
      c.page = "VIP";
      t.player.setConfig(c);
      t.root.querySelector('[data-p="pp-vip-level"][data-level="5"]').click();
      if (
        !t.root.querySelector(".pp-section-title").textContent.includes("VIP 5")
      )
        return false;
      c.page = "账户";
      c.values.vipCard = "隐藏VIP资讯";
      t.player.setConfig(c);
      return (
        !t.root.querySelector(".pp-member-card") &&
        !!t.root.querySelector('.pp-account-menu [data-page="VIP"]')
      );
    });
  });
  check("59. 站内信展开、筛选及已读仅影响当前演示", () => {
    baseline();
    return NGStudio.testPlayer((t) => {
      const c = D.clone(t.config);
      c.page = "站内信";
      t.player.setConfig(c);
      t.root.querySelector('[data-p="pp-message"][data-index="0"]').click();
      if (!t.root.querySelector(".pp-message p")) return false;
      t.root
        .querySelector('[data-p="pp-inbox-filter"][data-index="2"]')
        .click();
      return (
        t.root.querySelectorAll(".pp-message").length === 1 &&
        t.root.querySelector(".pp-message").textContent.includes("活动通知")
      );
    });
  });
  check("60. 页面加载、空态、失败与访客隐私覆盖", () => {
    baseline();
    return NGStudio.testPlayer((t) => {
      const c = D.clone(t.config);
      c.page = "账户";
      for (const content of ["loading", "empty", "error"]) {
        c.content = content;
        t.player.setConfig(c);
        if (t.root.querySelector(".pp-money")) return false;
      }
      c.auth = "loggedOut";
      c.content = "normal";
      t.player.setConfig(c);
      return (
        !t.root.querySelector(".pp-money") &&
        !t.root.querySelector(".pp-identity") &&
        !!t.root.querySelector(".p-secondary")
      );
    });
  });
  check("61. 新页面样式参与保存及撤销", () => {
    baseline();
    const before = a.clone(a.state.draft.authVisual);
    a.state.draft.authVisual.extra.design = {
      mode: "SET",
      value: 4,
      sourceTheme: "NG",
    };
    if (!a.applyDraft(true)) return false;
    a.state.draft.authVisual.extra.design.value = 2;
    a.cancelDraft();
    const ok = a.state.draft.authVisual.extra.design.value === 4;
    a.state.draft.authVisual = before;
    return ok;
  });
};

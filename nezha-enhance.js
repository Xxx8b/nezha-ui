(function () {
  'use strict';

  // 选择器：点击“网络”按钮的 DOM 元素（需要手动点击才能切换网络模块）
  const selectorButton = '#root > div > main > div.mx-auto.w-full.max-w-5xl.px-0.flex.flex-col.gap-4.server-info > section > div.flex.justify-center.w-full.max-w-\\[200px\\] > div > div > div.relative.cursor-pointer.rounded-3xl.px-2\\.5.py-\\[8px\\].text-\\[13px\\].font-\\[600\\].transition-all.duration-500.text-stone-400.dark\\:text-stone-500';

  // 要隐藏的原始 section 模块（按钮容器）
  const selectorSection = '#root > div > main > div.mx-auto.w-full.max-w-5xl.px-0.flex.flex-col.gap-4.server-info > section';

  // 显示的 server 信息卡片（一般是 CPU 模块和 网络模块）
  const selector3 = '#root > div > main > div.mx-auto.w-full.max-w-5xl.px-0.flex.flex-col.gap-4.server-info > div:nth-child(3)';
  const selector4 = '#root > div > main > div.mx-auto.w-full.max-w-5xl.px-0.flex.flex-col.gap-4.server-info > div:nth-child(4)';

  let hasClicked = false;   // 标记是否已点击“网络”按钮
  let divVisible = false;   // 标记 div3/4 是否可见
  let swapping = false;     // 防止重复交换 DOM 元素

  // 强制 div3 和 div4 显示出来
  function forceBothVisible() {
    const div3 = document.querySelector(selector3);
    const div4 = document.querySelector(selector4);
    if (div3 && div4) {
      div3.style.display = 'block';
      div4.style.display = 'block';
    }
  }

  // 隐藏掉“section”区域，即网络选项卡按钮容器
  function hideSection() {
    const section = document.querySelector(selectorSection);
    if (section) {
      section.style.display = 'none';
    }
  }

  // 自动点击“网络”按钮，展开网络模块
  function tryClickButton() {
    const btn = document.querySelector(selectorButton);
    if (btn && !hasClicked) {
      btn.click();
      hasClicked = true;
      setTimeout(forceBothVisible, 500);  // 确保模块展开后显示
    }
  }

  // 把 div3 和 div4 的顺序调换，实现网络模块排到前面
  function swapDiv3AndDiv4() {
    if (swapping) return;
    swapping = true;

    const div3 = document.querySelector(selector3);
    const div4 = document.querySelector(selector4);
    if (!div3 || !div4) {
      swapping = false;
      return;
    }

    const parent = div3.parentNode;
    if (parent !== div4.parentNode) {
      swapping = false;
      return;
    }

    // 执行顺序调换
    parent.insertBefore(div4, div3);
    parent.insertBefore(div3, div4.nextSibling);

    swapping = false;
  }

  // 启动 MutationObserver 监听 DOM 变化并触发逻辑
  function startObserver() {
    const root = document.querySelector('#root');
    if (!root) return;

    const observer = new MutationObserver(() => {
      const div3 = document.querySelector(selector3);
      const div4 = document.querySelector(selector4);

      const isDiv3Visible = div3 && getComputedStyle(div3).display !== 'none';
      const isDiv4Visible = div4 && getComputedStyle(div4).display !== 'none';

      const isAnyDivVisible = isDiv3Visible || isDiv4Visible;

      // 初次可见，触发展开与交换逻辑
      if (isAnyDivVisible && !divVisible) {
        hideSection();           // 隐藏原始按钮容器
        tryClickButton();        // 点击“网络”按钮
        setTimeout(swapDiv3AndDiv4, 100);  // 延迟交换 DOM 顺序
      } else if (!isAnyDivVisible && divVisible) {
        hasClicked = false;  // 如果都不可见，重置点击标记
      }

      divVisible = isAnyDivVisible;

      // 如果两个模块有隐藏的，强制显示
      if (div3 && div4) {
        if (!isDiv3Visible || !isDiv4Visible) {
          forceBothVisible();
        }
      }
    });

    observer.observe(root, {
      childList: true,
      attributes: true,
      subtree: true,
      attributeFilter: ['style', 'class']
    });
  }

  // 确保在 DOM 加载后再运行逻辑，防止未加载完成时报错
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver);
  } else {
    startObserver();
  }
})();

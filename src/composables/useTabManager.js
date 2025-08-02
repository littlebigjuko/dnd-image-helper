import { ref } from "vue";

export function useTabManager() {
  const activeTab = ref("image-splitter");

  function switchToTab(tabId) {
    activeTab.value = tabId;
  }

  function activateDefaultTab() {
    switchToTab("image-splitter");
  }

  return {
    activeTab,
    switchToTab,
    activateDefaultTab,
  };
}

document.addEventListener("DOMContentLoaded", () => {
  // --- ESTADO E CHAVES DO LOCALSTORAGE ---
  let containers = [];
  let bookmarks = [];
  let activeContainerId = null;
  let draggedContainerId = null;
  let draggedBookmarkId = null;
  let activeSearchEngine = "google";
  let currentLayout = "grid";

  const bookmarksStorageKey = "my-homepage-bookmarks-v2";
  const containersStorageKey = "my-homepage-containers-v2";
  const searchEngineStorageKey = "my-homepage-search-engine";
  const layoutStorageKey = "my-homepage-layout";
  // --- ELEMENTOS DO DOM ---

  const containersWrapper = document.getElementById("containers-wrapper");
  const dialog = document.getElementById("bookmark-dialog");
  const dialogTitle = document.getElementById("dialog-title");
  const dialogForm = document.getElementById("bookmark-form");
  const bookmarkIdInput = document.getElementById("bookmark-id");
  const bookmarkNameInput = document.getElementById("bookmark-name");
  const bookmarkUrlInput = document.getElementById("bookmark-url");
  const cancelBtn = document.getElementById("cancel-bookmark-btn");
  const webSearchBar = document.getElementById("web-search-bar");
  const webSearchForm = document.getElementById("web-search-form");
  const webSearchSubmitBtn = document.getElementById("web-search-submit-btn");
  const engineSelectorBtn = document.getElementById("engine-selector-btn");
  const engineOptions = document.getElementById("engine-options");
  const importBtn = document.getElementById("import-btn");
  const exportBtn = document.getElementById("export-btn");
  const importFileInput = document.getElementById("import-file-input");
  const layoutToggleBtn = document.getElementById("layout-toggle-btn");
  const gridIcon = document.getElementById("layout-icon-grid");
  const listIcon = document.getElementById("layout-icon-list");

  // --- DEFINIÇÕES DE MECANISMOS DE BUSCA ---
  const searchEngines = {
    google: {
      name: "Google",
      url: "https://www.google.com/search?q=",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><path fill="#4285F4" d="M21.35,11.1H12.18V13.83H18.69C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C15.29,4.73 17.1,6.7 17.1,6.7L19,4.72C19,4.72 16.56,2 12.19,2C6.42,2 2.03,6.8 2.03,12C2.03,17.05 6.16,22 12.19,22C17.6,22 21.5,18.33 21.5,12.33C21.5,11.76 21.35,11.1 21.35,11.1V11.1Z"/></svg>`,
    },
    brave: {
      name: "Brave",
      url: "https://search.brave.com/search?q=",
      icon: `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 436.49 511.97" width="24" height="24"><defs><style>.cls-1{fill:url(#linear-gradient);}.cls-2{fill:#fff;}</style><linearGradient id="linear-gradient" x1="-18.79" y1="359.73" x2="194.32" y2="359.73" gradientTransform="matrix(2.05, 0, 0, -2.05, 38.49, 992.77)" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#f1562b"/><stop offset="0.3" stop-color="#f1542b"/><stop offset="0.41" stop-color="#f04d2a"/><stop offset="0.49" stop-color="#ef4229"/><stop offset="0.5" stop-color="#ef4029"/><stop offset="0.56" stop-color="#e83e28"/><stop offset="0.67" stop-color="#e13c26"/><stop offset="1" stop-color="#df3c26"/></linearGradient></defs><title>brave-browser</title><path class="cls-1" d="M436.49,165.63,420.7,122.75l11-24.6A8.47,8.47,0,0,0,430,88.78L400.11,58.6a48.16,48.16,0,0,0-50.23-11.66l-8.19,2.89L296.09,.43,218.25,0,140.4,.61,94.85,50.41l-8.11-2.87A48.33,48.33,0,0,0,36.19,59.3L5.62,90.05a6.73,6.73,0,0,0-1.36,7.47l11.47,25.56L0,165.92,56.47,380.64a89.7,89.7,0,0,0,34.7,50.23l111.68,75.69a24.73,24.73,0,0,0,30.89,0l111.62-75.8A88.86,88.86,0,0,0,380,380.53l46.07-176.14Z"/><path class="cls-2" d="M231,317.33a65.61,65.61,0,0,0-9.11-3.3h-5.49a66.08,66.08,0,0,0-9.11,3.3l-13.81,5.74-15.6,7.18-25.4,13.24a4.84,4.84,0,0,0-.62,9l22.06,15.49q7,5,13.55,10.76l6.21,5.35,13,11.37,5.89,5.2a10.15,10.15,0,0,0,12.95,0l25.39-22.18,13.6-10.77,22.06-15.79a4.8,4.8,0,0,0-.68-8.93l-25.36-12.8L244.84,323ZM387.4,175.2l.8-2.3a61.26,61.26,0,0,0-.57-9.18,73.51,73.51,0,0,0-8.19-15.44l-14.35-21.06-10.22-13.88-19.23-24a69.65,69.65,0,0,0-5.7-6.67h-.4L321,84.25l-42.27,8.14a33.49,33.49,0,0,1-12.59-1.84l-23.21-7.5-16.61-4.59a70.52,70.52,0,0,0-14.67,0L195,83.1l-23.21,7.54a33.89,33.89,0,0,1-12.59,1.84l-42.22-8-8.54-1.58h-.4a65.79,65.79,0,0,0-5.7,6.67l-19.2,24Q77.81,120.32,73,127.45L58.61,148.51l-6.78,11.31a51,51,0,0,0-1.94,13.35l.8,2.3A34.51,34.51,0,0,0,52,179.81l11.33,13,50.23,53.39a14.31,14.31,0,0,1,2.55,14.34L107.68,280a25.23,25.23,0,0,0-.39,16l1.64,4.52a43.58,43.58,0,0,0,13.39,18.76l7.89,6.43a15,15,0,0,0,14.35,1.72L172.62,314A70.38,70.38,0,0,0,187,304.52l22.46-20.27a9,9,0,0,0,3-6.36,9.08,9.08,0,0,0-2.5-6.56L159.2,237.18a9.83,9.83,0,0,1-3.09-12.45l19.66-36.95a19.21,19.21,0,0,0,1-14.67A22.37,22.37,0,0,0,165.58,163L103.94,139.8c-4.44-1.6-4.2-3.6.51-3.88l36.2-3.59a55.9,55.9,0,0,1,16.9,1.5l31.5,8.8a9.64,9.64,0,0,1,6.74,10.76L183.42,221a34.72,34.72,0,0,0-.61,11.41c.5,1.61,4.73,3.6,9.36,4.73l19.19,4a46.38,46.38,0,0,0,16.86,0l17.26-4c4.64-1,8.82-3.23,9.35-4.85a34.94,34.94,0,0,0-.63-11.4l-12.45-67.59a9.66,9.66,0,0,1,6.74-10.76l31.5-8.83a55.87,55.87,0,0,1,16.9-1.5l36.2,3.37c4.74.44,5,2.2.54,3.88L272,162.79a22.08,22.08,0,0,0-11.16,10.12,19.3,19.3,0,0,0,1,14.67l19.69,36.95A9.84,9.84,0,0,1,278.45,237l-50.66,34.23a9,9,0,0,0,.32,12.78l.15.14,22.49,20.27a71.46,71.46,0,0,0,14.35,9.47l28.06,13.35a14.89,14.89,0,0,0,14.34-1.76l7.9-6.45a43.53,43.53,0,0,0,13.38-18.8l1.65-4.52a25.27,25.27,0,0,0-.39-16l-8.26-19.49a14.4,14.4,0,0,1,2.55-14.35l50.23-53.45,11.3-13a35.8,35.8,0,0,0,1.54-4.24Z"/></svg>`,
    },
    duck_duck: {
      name: "DuckDuckGo",
      url: "https://duckduckgo.com/?q=",
      icon: `<svg xmlns="http://www.w3.org/2000/svg" aria-label="DuckDuckGo" role="img"  width="24" height="24"  viewBox="-128 -128 256 256" fill="#ffffff" stroke="#ffffff"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"><rect width="256" height="256" rx="15%" x="-128" y="-128"></rect><circle r="108" fill="#d53"></circle><circle r="96" fill="none" stroke="#ffffff" stroke-width="7"></circle><path d="M-32-55C-62-48-51-6-51-6l19 93 7 3M-39-73h-8l11 4s-11 0-11 7c24-1 35 5 35 5" fill="#ddd"></path><path d="M25 95S1 57 1 32c0-47 31-7 31-44S1-58 1-58c-15-19-44-15-44-15l7 4s-7 2-9 4 19-3 28 5c-37 3-31 33-31 33l21 120"></path><path d="M25-1l38-10c34 5-29 24-33 23C0 7 9 32 45 24s9 20-24 9C-26 20-1-3 25-1" fill="#fc0"></path><path d="M15 78l2-3c22 8 23 11 22-9s0-20-23-3c0-5-13-3-15 0-21-9-23-12-22 2 2 29 1 24 21 14" fill="#6b5"></path><path d="M-1 67v12c1 2 17 2 17-2s-8 3-13 1-2-13-2-13" fill="#4a4"></path><path d="M-23-32c-5-6-18-1-15 7 1-4 8-10 15-7m32 0c1-6 11-7 14-1-4-2-10-2-14 1m-33 16a2 2 0 1 1 0 1m-8 3a7 7 0 1 0 0-1m52-6a2 2 0 1 1 0 1m-6 3a6 6 0 1 0 0-1" fill="#148"></path></g></svg>`,
    },
    youtube: {
      name: "YouTube",
      url: "https://www.youtube.com/results?search_query=",
      icon: `<svg height="24" width="24" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 461.001 461.001" xml:space="preserve" fill="#000000"><g id="SVGRepo_bgCarrier" stroke-width="0"></g><g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g><g id="SVGRepo_iconCarrier"> <g> <path style="fill:#F61C0D;" d="M365.257,67.393H95.744C42.866,67.393,0,110.259,0,163.137v134.728 c0,52.878,42.866,95.744,95.744,95.744h269.513c52.878,0,95.744-42.866,95.744-95.744V163.137 C461.001,110.259,418.135,67.393,365.257,67.393z M300.506,237.056l-126.06,60.123c-3.359,1.602-7.239-0.847-7.239-4.568V168.607 c0-3.774,3.982-6.22,7.348-4.514l126.06,63.881C304.363,229.873,304.298,235.248,300.506,237.056z"></path> </g> </g></svg>`,
    },
    x: {
      name: "X.com",
      url: "https://x.com/search?q=",
      icon: `<svg xmlns="http://www.w3.org/2000/svg"  height="24" width="24"  shape-rendering="geometricPrecision" text-rendering="geometricPrecision" image-rendering="optimizeQuality" fill-rule="evenodd" clip-rule="evenodd" viewBox="0 0 512 462.799"><path fill-rule="nonzero" d="M403.229 0h78.506L310.219 196.04 512 462.799H354.002L230.261 301.007 88.669 462.799h-78.56l183.455-209.683L0 0h161.999l111.856 147.88L403.229 0zm-27.556 415.805h43.505L138.363 44.527h-46.68l283.99 371.278z"/></svg>`,
    },
  };

  // --- FUNÇÕES DE LÓGICA ---
  const saveData = () => {
    localStorage.setItem(containersStorageKey, JSON.stringify(containers));
    localStorage.setItem(bookmarksStorageKey, JSON.stringify(bookmarks));
  };

  const loadData = () => {
    const savedContainers = localStorage.getItem(containersStorageKey);
    const savedBookmarks = localStorage.getItem(bookmarksStorageKey);
    const savedEngine = localStorage.getItem(searchEngineStorageKey);
    const savedLayout = localStorage.getItem(layoutStorageKey);

    containers = savedContainers
      ? JSON.parse(savedContainers)
      : [{ id: crypto.randomUUID(), title: "Categoria" }];
    bookmarks = savedBookmarks ? JSON.parse(savedBookmarks) : [];
    activeSearchEngine = savedEngine || "google";
    currentLayout = savedLayout || "grid";
  };

  const render = (searchTerm = "") => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    containersWrapper.innerHTML = "";

    containers.forEach((container) => {
      const containerBookmarks = bookmarks.filter(
        (b) =>
          b.containerId === container.id &&
          b.name.toLowerCase().includes(lowerCaseSearchTerm)
      );

      if (!lowerCaseSearchTerm || containerBookmarks.length > 0) {
        containersWrapper.appendChild(
          createContainerElement(container, containerBookmarks)
        );
      }
    });

    if (containersWrapper.innerHTML === "" && lowerCaseSearchTerm) {
      containersWrapper.innerHTML = `<p class="text-center text-gray-300 w-full">Nenhum favorito encontrado para "${searchTerm}".</p>`;
    }

    if (!lowerCaseSearchTerm) {
      containersWrapper.appendChild(createAddCategoryBox());
    }
  };

  const updateSearchEngineUI = () => {
    engineSelectorBtn.innerHTML = searchEngines[activeSearchEngine].icon;
    localStorage.setItem(searchEngineStorageKey, activeSearchEngine);
    webSearchBar.placeholder = `Pesquisar com ${searchEngines[activeSearchEngine].name} ou digite uma URL...`;
  };

  const applyLayout = () => {
    if (currentLayout === "grid") {
      gridIcon.classList.add("hidden");
      listIcon.classList.remove("hidden");
    } else {
      gridIcon.classList.remove("hidden");
      listIcon.classList.add("hidden");
    }
    render(webSearchBar.value);
  };

  const toggleLayout = () => {
    currentLayout = currentLayout === "grid" ? "list" : "grid";
    localStorage.setItem(layoutStorageKey, currentLayout);
    applyLayout();
  };

  // --- FUNÇÕES DE CRIAÇÃO DE ELEMENTOS ---

  const createBookmarkElement = (bookmark) => {
    const faviconUrl = `https://www.google.com/s2/favicons?sz=64&domain_url=${bookmark.url}`;
    const fallbackIconM = "https://placehold.co/32x32/eeeeee/999999?text=?";
    const fallbackIconS = "https://placehold.co/24x24/eeeeee/999999?text=?";
    const element = document.createElement("div");

    element.setAttribute("draggable", "true");
    element.dataset.id = bookmark.id;

    if (currentLayout === "list") {
      element.className =
        "relative flex items-center group/item p-2 rounded-lg hover:bg-gray-200";
      element.innerHTML = `
                  
                  <a href="${bookmark.url}" rel="noopener noreferrer" class="flex items-center">
                    <img src="${faviconUrl}" alt="" class="w-6 h-6 object-contain mr-3 rounded" onerror="this.src='${fallbackIconS}';" />
                    <span class="flex-grow text-sm text-gray-700">${bookmark.name}</span>
                  </a>
                  <div class="flex items-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                      <button class="edit-bookmark-btn p-1 text-gray-500 hover:text-blue-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                      </button>
                      <button class="remove-bookmark-btn p-1 text-gray-500 hover:text-red-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                      </button>
                  </div>
              `;
    } else {
      element.className = "relative flex flex-col items-center group/item";
      element.innerHTML = `
                  <a href="${bookmark.url}" rel="noopener noreferrer" class="flex flex-col items-center p-2 rounded-lg hover:bg-gray-200 transition-colors duration-200 w-full">
                      <img src="${faviconUrl}" alt="Ícone de ${bookmark.name}" class="w-8 h-8 object-contain mb-2 rounded-md shadow-sm" onerror="this.src='${fallbackIconM}';" />
                      <span class="text-sm font-medium text-gray-700 break-words text-center w-full px-1">${bookmark.name}</span>
                  </a>
                  <button class="edit-bookmark-btn absolute top-0 left-0 p-1 text-gray-500 hover:text-blue-600 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"></path></svg>
                  </button>
                  <button class="remove-bookmark-btn absolute top-0 right-0 p-1 text-gray-500 hover:text-red-600 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
              `;
    }

    element.addEventListener("dragstart", (e) => {
      e.stopPropagation();
      draggedBookmarkId = bookmark.id;
      setTimeout(() => element.classList.add("dragging"), 0);
    });
    element.addEventListener("dragend", () =>
      element.classList.remove("dragging")
    );
    element.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.stopPropagation();
      element.classList.add("drag-over-bookmark");
    });
    element.addEventListener("dragleave", () =>
      element.classList.remove("drag-over-bookmark")
    );
    element.addEventListener("drop", (e) => {
      e.preventDefault();
      e.stopPropagation();
      element.classList.remove("drag-over-bookmark");
      if (!draggedBookmarkId || draggedBookmarkId === bookmark.id) return;

      const draggedIndex = bookmarks.findIndex(
        (b) => b.id === draggedBookmarkId
      );
      const targetIndex = bookmarks.findIndex((b) => b.id === bookmark.id);

      const [draggedItem] = bookmarks.splice(draggedIndex, 1);
      bookmarks.splice(targetIndex, 0, draggedItem);
      draggedItem.containerId = bookmark.containerId;

      saveData();
      render(webSearchBar.value);
    });

    element
      .querySelector(".edit-bookmark-btn")
      .addEventListener("click", () => {
        dialogTitle.textContent = "Editar Favorito";
        bookmarkIdInput.value = bookmark.id;
        bookmarkNameInput.value = bookmark.name;
        bookmarkUrlInput.value = bookmark.url;
        dialog.classList.remove("hidden");
      });

    element
      .querySelector(".remove-bookmark-btn")
      .addEventListener("click", () => {
        bookmarks = bookmarks.filter((b) => b.id !== bookmark.id);
        saveData();
        render(webSearchBar.value);
      });
    return element;
  };

  const createContainerElement = (container, containerBookmarks) => {
    const element = document.createElement("div");
    element.className =
      "bg-gray-50 p-4 rounded-lg shadow-md relative group/category transition-all";

    element.setAttribute("draggable", "true");
    element.dataset.id = container.id;

    element.addEventListener("dragstart", (e) => {
      draggedContainerId = container.id;
      setTimeout(() => e.target.classList.add("dragging"), 0);
    });
    element.addEventListener("dragend", (e) =>
      e.target.classList.remove("dragging")
    );
    element.addEventListener("dragover", (e) => {
      e.preventDefault();
      e.target.closest(".group\\/category").classList.add("drag-over");
    });
    element.addEventListener("dragleave", (e) =>
      e.target.closest(".group\\/category").classList.remove("drag-over")
    );
    element.addEventListener("drop", (e) => {
      e.preventDefault();
      const targetContainer = e.target.closest(".group\\/category");
      targetContainer.classList.remove("drag-over");

      if (draggedBookmarkId) {
        const bookmark = bookmarks.find((b) => b.id === draggedBookmarkId);
        if (bookmark) {
          bookmark.containerId = container.id;
          saveData();
          render(webSearchBar.value);
        }
      } else if (draggedContainerId && draggedContainerId !== container.id) {
        const draggedIndex = containers.findIndex(
          (c) => c.id === draggedContainerId
        );
        const targetIndex = containers.findIndex((c) => c.id === container.id);
        const [draggedItem] = containers.splice(draggedIndex, 1);
        containers.splice(targetIndex, 0, draggedItem);
        saveData();
        render(webSearchBar.value);
      }
      draggedBookmarkId = null;
      draggedContainerId = null;
    });

    const header = document.createElement("div");
    header.className = "flex justify-between items-center mb-4";
    const titleElement = document.createElement("h2");
    titleElement.className =
      "text-xl font-bold text-gray-800 cursor-pointer flex-grow";
    titleElement.textContent = container.title;

    titleElement.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "text";
      input.value = container.title;
      input.className = "text-xl font-bold text-gray-800 title-input";
      const saveEdit = () => {
        const newTitle = input.value.trim();
        if (newTitle) container.title = newTitle;
        saveData();
        render(webSearchBar.value);
      };
      input.addEventListener("blur", saveEdit);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") input.blur();
        if (e.key === "Escape") render(webSearchBar.value);
      });
      titleElement.replaceWith(input);
      input.focus();
      input.select();
    });

    const removeContainerBtn = document.createElement("button");
    removeContainerBtn.className =
      "absolute top-3 right-3 w-7 h-7 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-lg opacity-0 group-hover/category:opacity-100 transition-all duration-200 hover:bg-red-500 hover:text-white";
    removeContainerBtn.innerHTML = "&times;";
    removeContainerBtn.ariaLabel = `Remover categoria ${container.title}`;
    removeContainerBtn.addEventListener("click", () => {
      if (
        confirm(
          `Tem certeza que deseja remover a categoria "${container.title}" e todos os seus favoritos?`
        )
      ) {
        containers = containers.filter((c) => c.id !== container.id);
        bookmarks = bookmarks.filter((b) => b.containerId !== container.id);
        saveData();
        render(webSearchBar.value);
      }
    });

    header.appendChild(titleElement);
    element.appendChild(removeContainerBtn);

    const grid = document.createElement("div");
    grid.className =
      currentLayout === "grid"
        ? "flex flex-wrap gap-x-4 gap-y-6"
        : "flex flex-col gap-1";
    containerBookmarks.forEach((bookmark) =>
      grid.appendChild(createBookmarkElement(bookmark))
    );

    const addBookmarkBox = createAddBookmarkBox(
      container.id,
      containerBookmarks.length > 0
    );

    grid.appendChild(addBookmarkBox);

    element.appendChild(header);
    element.appendChild(grid);
    return element;
  };

  const createAddBookmarkBox = (containerId, hasBookmarks) => {
    const addBookmarkBox = document.createElement("div");

    if (currentLayout === "list") {
      if (hasBookmarks) {
        addBookmarkBox.className =
          "flex items-center p-2 rounded-lg hover:bg-gray-200 cursor-pointer text-gray-500 opacity-0 group-hover/category:opacity-100 transition-opacity duration-300";
      } else {
        addBookmarkBox.className =
          "flex items-center p-2 rounded-lg hover:bg-gray-200 cursor-pointer text-gray-600";
      }
      addBookmarkBox.innerHTML = `
                    <svg class="w-6 h-6 mr-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    <span class="text-sm">Adicionar</span>
                `;
    } else {
      if (hasBookmarks) {
        addBookmarkBox.className =
          "flex flex-col items-center justify-center p-2 cursor-pointer text-gray-500 opacity-0 group-hover/category:opacity-100 transition-opacity duration-300";
      } else {
        addBookmarkBox.className =
          "flex flex-col items-center justify-center p-2 cursor-pointer text-gray-600 font-medium";
      }
      addBookmarkBox.innerHTML = `
                    <div class="flex items-center justify-center w-8 h-8 rounded-md border-2 border-dashed border-gray-400 text-gray-400 hover:bg-gray-200 hover:text-gray-600 hover:border-gray-600 transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                    </div>
                    <span class="mt-2 text-sm">Adicionar</span>
                `;
    }

    addBookmarkBox.addEventListener("click", () => {
      dialogTitle.textContent = "Adicionar novo site favorito";
      dialogForm.reset();
      activeContainerId = containerId;
      dialog.classList.remove("hidden");
    });
    return addBookmarkBox;
  };

  const createAddCategoryBox = () => {
    const addContainerBox = document.createElement("div");
    addContainerBox.className =
      "cursor-pointer bg-gray-50/50 border-2 border-dashed border-gray-200 px-8 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center min-h-[148px]";

    const addTitle = document.createElement("h2");
    addTitle.className = "text-xl font-bold text-gray-400 text-center";
    addTitle.textContent = "+ Adicionar";
    addContainerBox.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Nome da Nova Categoria";
      input.className =
        "text-xl font-bold text-gray-800 title-input text-center";
      const saveNew = () => {
        const title = input.value.trim();
        if (title) {
          containers.push({ id: crypto.randomUUID(), title });
          saveData();
        }
        render();
      };
      input.addEventListener("blur", saveNew);
      input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") input.blur();
        if (e.key === "Escape") render();
      });
      addContainerBox.innerHTML = "";
      addContainerBox.appendChild(input);
      input.focus();
    });
    addContainerBox.appendChild(addTitle);
    return addContainerBox;
  };

  // --- MANIPULADORES DE EVENTOS ---

  webSearchBar.addEventListener("input", (e) => render(e.target.value));

  webSearchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = webSearchBar.value.trim();
    if (query) {
      const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i;
      if (urlPattern.test(query)) {
        let url = query;
        if (!/^https?:\/\//i.test(url)) {
          url = "https://" + url;
        }
        window.location.href = url;
      } else {
        window.location.href =
          searchEngines[activeSearchEngine].url + encodeURIComponent(query);
      }
    }
  });

  webSearchSubmitBtn.addEventListener("mousedown", (e) => {
    // Botão do meio
    if (e.button === 1) {
      e.preventDefault();
      const query = webSearchBar.value.trim();
      if (query) {
        const urlPattern =
          /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i;
        //se for url
        if (urlPattern.test(query)) {
          let url = query;
          // se a url nao tiver http ou https, adiciona https
          if (!/^https?:\/\//i.test(url)) {
            url = "https://" + url;
          }
          window.open(url, "_blank");
        } else {
          window.open(
            searchEngines[activeSearchEngine].url + encodeURIComponent(query),
            "_blank"
          );
        }
      }
    }
  });

  engineSelectorBtn.addEventListener("click", () =>
    engineOptions.classList.toggle("hidden")
  );

  document.addEventListener("click", (e) => {
    if (
      !engineSelectorBtn.contains(e.target) &&
      !engineOptions.contains(e.target)
    ) {
      engineOptions.classList.add("hidden");
    }
  });

  Object.keys(searchEngines).forEach((key) => {
    const option = document.createElement("button");
    option.type = "button";
    option.className =
      "flex items-center gap-2 w-full text-left p-2 hover:bg-gray-100";
    option.innerHTML = `${searchEngines[key].icon} <span>${searchEngines[key].name}</span>`;
    option.addEventListener("click", () => {
      activeSearchEngine = key;
      updateSearchEngineUI();
      engineOptions.classList.add("hidden");
    });
    engineOptions.appendChild(option);
  });

  dialogForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = bookmarkIdInput.value;
    const name = bookmarkNameInput.value.trim();
    const url = bookmarkUrlInput.value.trim();

    if (name && url) {
      const cleanedUrl = url
        .replace(/^(?:https?:\/\/)?/i, "")
        .replace(/^www\./i, "");
      const finalUrl = "https://" + cleanedUrl;

      if (id) {
        const bookmark = bookmarks.find((b) => b.id === id);
        if (bookmark) {
          bookmark.name = name;
          bookmark.url = finalUrl;
        }
      } else {
        bookmarks.push({
          id: crypto.randomUUID(),
          name,
          url: finalUrl,
          containerId: activeContainerId,
        });
      }

      saveData();
      render(webSearchBar.value);
      dialog.classList.add("hidden");
    }
  });

  cancelBtn.addEventListener("click", () => dialog.classList.add("hidden"));
  dialog.addEventListener("click", (e) => {
    if (e.target === dialog) cancelBtn.click();
  });

  exportBtn.addEventListener("click", () => {
    const dataStr = JSON.stringify({ containers, bookmarks }, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "meus_favoritos_backup.json";
    link.click();
    URL.revokeObjectURL(url);
  });

  importBtn.addEventListener("click", () => importFileInput.click());

  importFileInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (
          data &&
          Array.isArray(data.containers) &&
          Array.isArray(data.bookmarks)
        ) {
          if (
            confirm(
              "Isso irá substituir todos os seus favoritos e categorias atuais. Deseja continuar?"
            )
          ) {
            containers = data.containers;
            bookmarks = data.bookmarks;
            saveData();
            render();
          }
        } else {
          alert("Arquivo de backup inválido.");
        }
      } catch (error) {
        alert(
          "Erro ao ler o arquivo. Certifique-se de que é um backup válido."
        );
        console.error("Erro na importação:", error);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  layoutToggleBtn.addEventListener("click", toggleLayout);

  // --- INICIALIZAÇÃO ---
  loadData();
  updateSearchEngineUI();
  applyLayout();
  webSearchBar.focus();
});

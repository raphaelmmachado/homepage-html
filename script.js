import searchEngines from "./config/searchEngines.js";
document.addEventListener("DOMContentLoaded", () => {
  // --- ESTADO E CHAVES DO LOCALSTORAGE ---
  let containers = [];
  let bookmarks = [];
  let articles = []; // Added articles array for read later functionality
  let activeContainerId = null;
  let draggedContainerId = null;
  let draggedBookmarkId = null;
  let activeSearchEngine = "brave";
  let currentLayout = "grid";
  let currentTheme = "light";

  const bookmarksStorageKey = "my-homepage-bookmarks-v2";
  const containersStorageKey = "my-homepage-containers-v2";
  const articlesStorageKey = "my-homepage-articles-v1"; // Added articles storage key
  const searchEngineStorageKey = "my-homepage-search-engine";
  const layoutStorageKey = "my-homepage-layout";
  const themeStorageKey = "my-homepage-theme";

  // --- ELEMENTOS DO DOM ---
  const containersWrapper = document.getElementById("containers-wrapper");
  const dialog = document.getElementById("bookmark-dialog");
  const dialogTitle = document.getElementById("dialog-title");
  const dialogForm = document.getElementById("bookmark-form");
  const bookmarkIdInput = document.getElementById("bookmark-id");
  const bookmarkNameInput = document.getElementById("bookmark-name");
  const bookmarkDescriptionInput = document.getElementById(
    "bookmark-description"
  );
  const bookmarkUrlInput = document.getElementById("bookmark-url");
  const cancelBtn = document.getElementById("cancel-bookmark-btn");
  const deleteBookmarkBtn = document.getElementById("delete-bookmark-btn");
  const webSearchBar = document.getElementById("web-search-bar");
  const webSearchForm = document.getElementById("web-search-form");
  const webSearchButton = document.getElementById("web-search-submit-btn");
  const engineSelectorBtn = document.getElementById("engine-selector-btn");
  const engineOptions = document.getElementById("engine-options");
  const importBtn = document.getElementById("import-btn");
  const exportBtn = document.getElementById("export-btn");
  const importFileInput = document.getElementById("import-file-input");
  const layoutToggleBtn = document.getElementById("layout-toggle-btn");
  const gridIcon = document.getElementById("layout-icon-grid");
  const listIcon = document.getElementById("layout-icon-list");
  const alertDialog = document.getElementById("alert-dialog");
  const alertDialogTitle = document.getElementById("alert-dialog-title");
  const alertDialogMessage = document.getElementById("alert-dialog-message");
  const alertDialogButtons = document.getElementById("alert-dialog-buttons");
  const themeToggleBtn = document.getElementById("theme-toggle-btn");
  const sunIcon = document.getElementById("theme-icon-sun");
  const moonIcon = document.getElementById("theme-icon-moon");
  const searchResultsWrapper = document.getElementById(
    "search-results-wrapper"
  );
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const mobileMenuDropdown = document.getElementById("mobile-menu-dropdown");
  const mobileMenuItemsContainer = document.getElementById("mobile-menu-items");
  const appDiv = document.getElementById("app");
  const articlesWrapper = document.getElementById("articles-wrapper");
  const articlesSection = document.getElementById("articles-section");
  const articleForm = document.getElementById("article-form");
  const articleUrlInput = document.getElementById("article-url-input");
  const navButtons = document.querySelectorAll("[data-class=nav-buttons]");

  // --- FUNÇÕES DE LÓGICA ---
  const showModal = (
    message,
    title = "Atenção",
    buttons = [{ text: "OK", class: "primary" }]
  ) => {
    return new Promise((resolve) => {
      alertDialogTitle.textContent = title;
      alertDialogMessage.textContent = message;
      alertDialogButtons.innerHTML = "";
      buttons.forEach((btnInfo) => {
        const button = document.createElement("button");
        button.textContent = btnInfo.text;
        const baseClass =
          "font-semibold py-2 px-6 rounded-lg transition-colors";
        if (btnInfo.class === "danger") {
          button.className = `${baseClass} bg-red-600 text-white hover:bg-red-700`;
        } else if (btnInfo.class === "secondary") {
          button.className = `${baseClass} bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500`;
        } else {
          button.className = `${baseClass} bg-blue-600 text-white hover:bg-blue-700`;
        }
        button.addEventListener("click", () => {
          alertDialog.classList.add("hidden");
          resolve(btnInfo.value);
        });
        alertDialogButtons.appendChild(button);
      });
      alertDialog.classList.remove("hidden");
    });
  };

  const saveData = () => {
    localStorage.setItem(containersStorageKey, JSON.stringify(containers));
    localStorage.setItem(bookmarksStorageKey, JSON.stringify(bookmarks));
    localStorage.setItem(articlesStorageKey, JSON.stringify(articles)); // Save articles to localStorage
  };

  const loadData = () => {
    const savedContainers = localStorage.getItem(containersStorageKey);
    const savedBookmarks = localStorage.getItem(bookmarksStorageKey);
    const savedArticles = localStorage.getItem(articlesStorageKey); // Load articles from localStorage
    const savedEngine = localStorage.getItem(searchEngineStorageKey);
    const savedLayout = localStorage.getItem(layoutStorageKey);
    const savedTheme = localStorage.getItem(themeStorageKey);
    containers = savedContainers ? JSON.parse(savedContainers) : [];
    bookmarks = savedBookmarks ? JSON.parse(savedBookmarks) : [];
    articles = savedArticles ? JSON.parse(savedArticles) : []; // Initialize articles array
    activeSearchEngine = savedEngine || "brave";
    currentLayout = savedLayout || "grid";
    currentTheme = savedTheme || "light";
  };

  const extractTitleFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      const hostname = urlObj.hostname.replace("www.", "");
      const pathname = urlObj.pathname;

      // Try to extract meaningful title from pathname
      if (pathname && pathname !== "/") {
        const pathParts = pathname.split("/").filter((part) => part);
        if (pathParts.length > 0) {
          const lastPart = pathParts[pathParts.length - 1];
          // Convert URL-friendly format to readable title
          return lastPart
            .replace(/[-_]/g, " ")
            .replace(/\.(html|php|aspx?)$/i, "")
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        }
      }

      // Fallback to hostname
      return hostname.charAt(0).toUpperCase() + hostname.slice(1);
    } catch {
      return "Artigo";
    }
  };
  const extractFaviconFromURL = (url) => {
    const favIcon = `https://www.google.com/s2/favicons?sz=64&domain_url=${url}`;
    return favIcon;
  };

  const createArticleElement = (article) => {
    const element = document.createElement("div");
    element.className =
      "bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow group relative";
    // adicionar target="_blank" ao element <a> para abrir em nova guia
    element.innerHTML = `
      <div class="flex flex-col h-full">
        <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2 line-clamp-2">${
          article.title
        }</h3>
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-3 flex-grow">${
          article.description
        }</p>
        <div class="flex items-center justify-between">
          <span class="text-xs text-gray-500 dark:text-gray-500">${new Date(
            article.dateAdded
          ).toLocaleDateString("pt-BR")}</span>
          <div class="flex gap-2">
            <a href="${article.url}"  rel="noopener noreferrer" 
               class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium">
              Ler
            </a>
            <button class="remove-article-btn text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              Remover
            </button>
          </div>
        </div>
      </div>
    `;

    // Add remove functionality
    element
      .querySelector(".remove-article-btn")
      .addEventListener("click", async () => {
        const confirmed = await showModal(
          `Tem certeza que deseja remover este artigo?`,
          "Confirmar Remoção",
          [
            { text: "Cancelar", class: "secondary", value: false },
            { text: "Remover", class: "danger", value: true },
          ]
        );
        if (confirmed) {
          articles = articles.filter((a) => a.id !== article.id);
          saveData();
          renderArticles();
        }
      });

    return element;
  };

  const renderArticles = () => {
    articlesWrapper.innerHTML = "";

    articles.forEach((article) => {
      articlesWrapper.appendChild(createArticleElement(article));
    });
  };

  const render = (searchTerm = "") => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    if (lowerCaseSearchTerm) {
      appDiv.classList.add("hidden");
      searchResultsWrapper.classList.remove("hidden");
      searchResultsWrapper.innerHTML = "";
      const filteredBookmarks = bookmarks.filter(({ name, title }) => {
        // acabei fazendo merda então tenho que checar se é title ou name
        // use a array que tiver length maior que 0
        return name
          ? name.toLowerCase().includes(lowerCaseSearchTerm)
          : title.toLowerCase().includes(lowerCaseSearchTerm) ||
              (b.description &&
                b.description.toLowerCase().includes(lowerCaseSearchTerm));
      });
      const filteredArticles = articles.filter((a) =>
        a.title.toLowerCase().includes(lowerCaseSearchTerm)
      );

      if (filteredBookmarks.length > 0 || filteredArticles.length > 0) {
        const resultsContainer = document.createElement("div");
        resultsContainer.className =
          "bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md relative transition-all w-full";

        const header = document.createElement("div");
        header.className = "flex justify-between items-center mb-4";
        const tabKeyIcon = document.createElement("span");
        tabKeyIcon.innerHTML = `<svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
 <rect x="5" y="5" width="50" height="50" rx="8" fill="#1E293B" stroke="#475569" stroke-width="2"/> <g fill="white"> <text x="10" y="20" font-family="Arial, sans-serif" font-size="10" font-weight="bold" fill="white">TAB</text>
    <rect x="18" y="28" width="3" height="15" rx="1.5" />
    <rect x="23" y="33" width="18" height="3" rx="1.5" />   
    <path d="M41 30L48 34.5L41 39V30Z" />
  </g>
</svg>`;
        const titleElement = document.createElement("h2");
        titleElement.className =
          "text-xl font-bold text-gray-800 dark:text-gray-200";
        titleElement.textContent = `🔍 Sites encontrados`;
        header.appendChild(titleElement);
        header.appendChild(tabKeyIcon);
        resultsContainer.appendChild(header);
        const resultsList = document.createElement("div");
        resultsList.className = "flex flex-col gap-1";
        const originalLayout = currentLayout;
        currentLayout = "list";
        filteredBookmarks.forEach((bookmark) => {
          resultsList.appendChild(createBookmarkElement(bookmark));
        });
        filteredArticles.forEach((article) => {
          resultsList.appendChild(createBookmarkElement(article));
        });
        currentLayout = originalLayout;
        resultsContainer.appendChild(resultsList);
        searchResultsWrapper.appendChild(resultsContainer);
      } else {
        searchResultsWrapper.innerHTML = `<p class="text-center text-sm text-gray-400 dark:text-gray-600 w-full py-8">Nenhum favorito encontrado para "${searchTerm}"</p>`;
      }
    } else {
      appDiv.classList.remove("hidden");
      searchResultsWrapper.classList.add("hidden");
      searchResultsWrapper.innerHTML = "";
      containersWrapper.innerHTML = "";
      containers.forEach((container) => {
        const containerBookmarks = bookmarks.filter(
          (b) => b.containerId === container.id
        );
        containersWrapper.appendChild(
          createContainerElement(container, containerBookmarks)
        );
      });
      if (containersWrapper.innerHTML !== "" || containers.length === 0) {
        containersWrapper.appendChild(createAddCategoryBox());
      }
    }
    renderArticles(); // Always render articles when updating the page
  };

  // ... existing code for other functions ...

  const updateSearchEngineUI = () => {
    engineSelectorBtn.innerHTML = searchEngines[activeSearchEngine].icon;
    localStorage.setItem(searchEngineStorageKey, activeSearchEngine);
    webSearchBar.placeholder = `${searchEngines[activeSearchEngine].placeholder}  ⬆️⬇️ para trocar mecanismo.`;
    if (searchEngines[activeSearchEngine].name === "Tradutor")
      webSearchBar.placeholder =
        "parametros: [Pesquisa] [idioma fonte (en)] [idioma destino (pt)]";
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

  const applyTheme = () => {
    if (currentTheme === "dark") {
      document.documentElement.classList.add("dark");
      sunIcon.classList.add("hidden");
      moonIcon.classList.remove("hidden");
    } else {
      document.documentElement.classList.remove("dark");
      sunIcon.classList.remove("hidden");
      moonIcon.classList.add("hidden");
    }
  };

  const toggleTheme = () => {
    currentTheme = currentTheme === "light" ? "dark" : "light";
    localStorage.setItem(themeStorageKey, currentTheme);
    applyTheme();
  };

  // --- FUNÇÕES DE CRIAÇÃO DE ELEMENTOS ---

  const createContainerElement = (container, containerBookmarks) => {
    const element = document.createElement("div");
    element.className = `bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md relative group/category transition-all`;
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
      "text-xl font-bold text-gray-800 dark:text-gray-200 cursor-pointer flex-grow";
    titleElement.textContent = container.title;
    titleElement.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "text";
      input.dataset.role = "change text";
      input.value = container.title;
      input.className =
        "text-xl font-bold text-gray-800 dark:text-gray-200 title-input";
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
      "absolute top-3 right-3 w-7 h-7 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full flex items-center justify-center text-lg opacity-0 group-hover/category:opacity-100 transition-all duration-200 hover:bg-red-500 hover:text-white";
    removeContainerBtn.innerHTML = "&times;";
    removeContainerBtn.ariaLabel = `Remover pasta ${container.title}`;
    removeContainerBtn.addEventListener("click", async () => {
      const confirmed = await showModal(
        `Tem certeza que deseja remover a pasta "${container.title}" e todos os seus favoritos?`,
        "Confirmar Exclusão",
        [
          { text: "Cancelar", class: "secondary", value: false },
          { text: "Remover", class: "danger", value: true },
        ]
      );
      if (confirmed) {
        containers = containers.filter((c) => c.id !== container.id);
        bookmarks = bookmarks.filter((b) => b.containerId !== container.id);
        saveData();
        render(webSearchBar.value);
      }
    });
    header.appendChild(titleElement);

    element.appendChild(removeContainerBtn);

    const grid = document.createElement("div");
    grid.dataset.id = "container";
    grid.className =
      currentLayout === "grid" ? "flex flex-wrap gap-2" : "flex flex-col gap-1";
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

  const createBookmarkElement = (bookmark) => {
    const faviconUrl = extractFaviconFromURL(bookmark.url);

    const element = document.createElement("div");
    element.setAttribute("draggable", "true");
    element.dataset.id = bookmark.id;
    // SE LAYOUT FOR LISTA
    if (currentLayout === "list") {
      containersWrapper.classList =
        "grid xl:grid-cols-5 lg:grid-cols-4 md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-6";
      element.className =
        "relative flex items-center group/item p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50";
      // adicionar target="_blank" ao element <a> para abrir em nova guia
      element.innerHTML = `
                      <a href="${
                        bookmark.url
                      }" rel="noopener noreferrer" class="flex items-center flex-grow" title="${
        bookmark.description || ""
      }">
                          <img src="${faviconUrl}" alt="${
        bookmark.title ?? bookmark.name
      }" class="w-6 h-6 object-contain mr-3 rounded" />
                          <span class="flex-grow text-sm text-gray-700 dark:text-gray-300">${
                            bookmark.title ?? bookmark.name
                          }</span>
                      </a>
                      <div class="flex items-center opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <button class="edit-bookmark-btn p-1 text-gray-500 hover:text-blue-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis-vertical-icon lucide-ellipsis-vertical"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>

                          </button>
                          
                      </div>`;
    }
    // SE LAYOUT FOR GRID
    else {
      containersWrapper.classList =
        "grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6";
      element.className =
        "relative flex flex-col items-center group/item w-20 rounded-lg  hover:bg-gray-200 dark:hover:bg-gray-700/50 transition-colors duration-200";
      element.innerHTML = `
                      <a href="${bookmark.url}" rel="noopener noreferrer"
                        class="flex flex-col items-center p-2" title="${
                          bookmark.description || ""
                        }">
                          <img src="${faviconUrl}" alt="Ícone de ${
        bookmark.title ?? bookmark.name
      }" class="w-7 h-7 object-contain mb-2 rounded-md shadow-sm"  />
                          <span class="text-sm text-gray-700 dark:text-gray-300 text-center w-full px-1">${
                            bookmark.title ?? bookmark.name
                          }</span>
                      </a>
                      <button class="edit-bookmark-btn absolute top-0 left-0 p-1 text-gray-500 hover:text-blue-600 opacity-0 group-hover/item:opacity-100 transition-opacity duration-200">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-ellipsis-vertical-icon lucide-ellipsis-vertical"><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
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
        bookmarkNameInput.value = bookmark.name ?? bookmark.title;
        bookmarkDescriptionInput.value = bookmark.description || "";
        bookmarkUrlInput.value = bookmark.url;
        dialog.classList.remove("hidden");
        deleteBookmarkBtn.classList.remove("hidden");
      });
    return element;
  };

  const createAddBookmarkBox = (containerId, hasBookmarks) => {
    const addBookmarkBox = document.createElement("div");
    addBookmarkBox.className = "add-bookmark-trigger";

    addBookmarkBox.className = `flex p-2 items-center rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700/50 cursor-pointer text-gray-500 transition-opacity duration-300
    ${currentLayout === "list" ? "" : "flex-col justify-center"}
    ${hasBookmarks ? "opacity-0 group-hover/category:opacity-100" : ""}`;

    if (currentLayout === "list") {
      addBookmarkBox.innerHTML = `
                      <svg class="w-6 h-6 mr-3" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      <span class="text-sm">Adicionar</span>`;
    } else {
      addBookmarkBox.innerHTML = `
                      <div class="flex items-center justify-center w-8 h-8 rounded-md border-2 border-dashed border-gray-400 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700/50 hover:text-gray-600 dark:hover:text-gray-300 hover:border-gray-600 transition-colors">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                      </div>
                      <span class="mt-2 text-sm">Adicionar</span>`;
    }
    addBookmarkBox.addEventListener("click", () => {
      dialogTitle.textContent = "Adicionar novo site favorito";
      dialogForm.reset();
      bookmarkIdInput.value = "";
      activeContainerId = containerId;
      dialog.classList.remove("hidden");
      deleteBookmarkBtn.classList.add("hidden");
    });
    return addBookmarkBox;
  };

  const createAddCategoryBox = () => {
    const addContainerBox = document.createElement("div");
    addContainerBox.className =
      "cursor-pointer bg-white/50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-600 px-8 rounded-lg hover:bg-white dark:hover:bg-gray-800 transition-colors flex items-center justify-center min-h-[148px]";
    const addTitle = document.createElement("h2");
    addTitle.className = "text-xl font-bold text-gray-400 text-center";
    addTitle.textContent = "+ Adicionar Pasta";
    addContainerBox.addEventListener("click", () => {
      const input = document.createElement("input");
      input.type = "text";
      input.placeholder = "Nome da Pasta";
      input.dataset.role = "change text";
      input.className =
        "text-xl font-bold text-gray-800 dark:text-gray-200 title-input text-center";
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

  // REDERIZA OS BOTÕES - TEMA, LAYOUT, ETC
  const renderNavButtons = () => {
    navButtons.forEach((btn) => {
      btn.classList.remove("invisible");
    });
  };

  // --- MANIPULADORES DE EVENTOS ---
  document.addEventListener("keydown", (event) => {
    // FOCO NA BARRA DE PESQUISA AO DIGITAR
    const key = event.key;
    if (
      key.length === 1 &&
      dialog.classList.contains("hidden") &&
      document.activeElement.dataset.role !== "change text"
    ) {
      webSearchBar.focus();
    }
  });
  // RENDERIZAÇÃO DINÂMICA DOS RESULTADOS DE PESQUISA
  webSearchBar.addEventListener("input", (e) => render(e.target.value));

  webSearchBar.addEventListener("keydown", (e) => {
    // FOCO NO PRIMEIRO RESULTADO AO TAB
    if (e.key === "Tab") {
      setTimeout(() => {
        if (searchResultsWrapper.childElementCount > 0) {
          const firstResultLink = searchResultsWrapper.querySelector("a[href]");
          if (firstResultLink) {
            e.preventDefault();
            firstResultLink.focus();
          }
        }
      }, 30); // espera o próximo ciclo do event loop
    }
    // LIMPAR PESQUISA COM ESCAPE
    if (e.key === "Escape") {
      e.target.value = "";
      render();
    }
    // SETA PARA CIMA ALTERA MECANISMO DE PESQUISA
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const engineKeys = Object.keys(searchEngines);
      let currentIndex = engineKeys.indexOf(activeSearchEngine);

      // adiciona engineKeys.length para evitar resultado negativo no modulo
      // subtrai 1 para ir para o mecanismo anterior / adiciona para ir para o próximo
      // usa modulo para circular entre os mecanismos
      // ex: se currentIndex for 0, (0 - 1 + 5) % 5 = 4 (último índice)

      currentIndex = (currentIndex - 1 + engineKeys.length) % engineKeys.length;
      activeSearchEngine = engineKeys[currentIndex];
      updateSearchEngineUI();
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const engineKeys = Object.keys(searchEngines);
      let currentIndex = engineKeys.indexOf(activeSearchEngine);

      // adiciona engineKeys.length para evitar resultado negativo no modulo
      // subtrai 1 para ir para o mecanismo anterior / adiciona para ir para o próximo
      // usa modulo para circular entre os mecanismos
      // ex: se currentIndex for 0, (0 - 1 + 5) % 5 = 4 (último índice)

      currentIndex = (currentIndex + 1 + engineKeys.length) % engineKeys.length;
      activeSearchEngine = engineKeys[currentIndex];
      updateSearchEngineUI();
    }
  });

  // NAVEGAÇÃO COM TECLADO NOS RESULTADOS DE PESQUISA
  searchResultsWrapper.addEventListener("keydown", (e) => {
    if (e.key === "ArrowUp" || e.key === "ArrowDown") {
      e.preventDefault();
      const links = Array.from(
        searchResultsWrapper.querySelectorAll("a[href]")
      );
      const focusedElement = document.activeElement;
      const currentIndex = links.findIndex((link) => link === focusedElement);
      if (currentIndex === -1) {
        if (links.length > 0) links[0].focus();
        return;
      }
      let nextIndex;
      if (e.key === "ArrowUp") {
        nextIndex = (currentIndex - 1 + links.length) % links.length;
      } else {
        nextIndex = (currentIndex + 1) % links.length;
      }
      if (links[nextIndex]) {
        links[nextIndex].focus();
      }
    } else if (e.key === "Enter" && document.activeElement.tagName === "A") {
      e.preventDefault();
      document.activeElement.click();
    } else if (e.key === "Escape" && document.activeElement.tagName === "A") {
      webSearchBar.value = "";
      render();
    }
  });

  webSearchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const query = webSearchBar.value.trim();
    if (query) {
      const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/i;
      if (urlPattern.test(query)) {
        let url = query;
        //se for url, ir direto
        if (!/^https?:\/\//i.test(url)) {
          url = "https://" + url;
        }
        window.open(url, "_self");
      } else {
        // GOOGLE TRANSLATE
        if (searchEngines[activeSearchEngine].name === "Tradutor") {
          q = query.split(" ");
          let url = ``;

          // se as penultima e ultima palavras foram preenchidas e contem duas letras, atribuir essa letra ao parametro de idioma da url do google translator. se não, atribuir valor default
          if (
            q.length >= 2 &&
            q[q.length - 2].length === 2 &&
            q[q.length - 1].length === 2
          ) {
            url = `https://translate.google.com.br/?sl=${q[q.length - 2]}&tl=${
              q[q.length - 1]
            }&text=${encodeURIComponent(q[0])}&op=translate`;
          } else {
            url = `https://translate.google.com.br/?sl=auto&tl=pt&text=${encodeURIComponent(
              query
            )}&op=translate`;
          }

          window.open(url, "_self");
        } else {
          // ANY OTHER SEARCH ENGINE
          const engine_url = searchEngines[activeSearchEngine].url;
          const fixed_query = encodeURIComponent(query).replace(/%20/g, "+");

          window.open(`${engine_url}${fixed_query}`, "_self");
        }
      }
    }
  });
  // ABRIR NOVA GUIA COM CLIQUE DO MEIO
  webSearchButton.addEventListener("mousedown", (e) => {
    e.preventDefault();
    const query = webSearchBar.value.trim();
    if (e.button == 1) {
      const engine_url = searchEngines[activeSearchEngine].url;
      const fixed_query = encodeURIComponent(query).replace(/%20/g, "+");

      window.open(`${engine_url}${fixed_query}`, "_blank");
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
      "flex items-center gap-2 w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700";
    option.innerHTML = `${searchEngines[key].icon} <span class="dark:text-gray-200">${searchEngines[key].name}</span>`;
    option.addEventListener("click", () => {
      activeSearchEngine = key;
      updateSearchEngineUI();
      engineOptions.classList.add("hidden");
    });
    engineOptions.appendChild(option);
  });

  articleForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = articleUrlInput.value.trim();

    if (!url) return;

    // Validate URL
    try {
      new URL(url.startsWith("http") ? url : "https://" + url);
    } catch {
      await showModal("Por favor, insira uma URL válida.", "URL Inválida");
      return;
    }

    const finalUrl = url.startsWith("http") ? url : "https://" + url;
    const title = extractTitleFromUrl(finalUrl);
    const description = `Artigo salvo de ${new URL(finalUrl).hostname}`;

    const newArticle = {
      id: crypto.randomUUID(),
      title,
      description,
      url: finalUrl,
      dateAdded: new Date().toISOString(),
    };

    articles.unshift(newArticle); // Add to beginning of array
    saveData();
    renderArticles();
    articleUrlInput.value = "";

    await showModal("Artigo adicionado com sucesso!", "Sucesso");
  });

  dialogForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = bookmarkIdInput.value;
    const title = bookmarkNameInput.value.trim();
    const description = bookmarkDescriptionInput.value.trim();
    const url = bookmarkUrlInput.value.trim();
    if (title && url) {
      const cleanedUrl = url
        .replace(/^(?:https?:\/\/)?/i, "")
        .replace(/^www\./i, "");
      const finalUrl = "https://" + cleanedUrl;
      if (id) {
        const bookmark = bookmarks.find((b) => b.id === id);
        if (bookmark) {
          bookmark.title = title;
          bookmark.description = description;
          bookmark.url = finalUrl;
        }
      } else {
        bookmarks.push({
          id: crypto.randomUUID(),
          title,
          description,
          url: finalUrl,
          containerId: activeContainerId,
        });
      }
      saveData();
      render(webSearchBar.value);
      dialog.classList.add("hidden");
    }
  });
  deleteBookmarkBtn.addEventListener("click", async () => {
    const id = bookmarkIdInput.value;
    if (!id) return;

    const confirmed = await showModal(
      "Tem certeza que deseja remover este favorito?",
      "Confirmar Exclusão",
      [
        { text: "Cancelar", class: "secondary", value: false },
        { text: "Remover", class: "danger", value: true },
      ]
    );

    if (confirmed) {
      bookmarks = bookmarks.filter((b) => b.id !== id);
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
    const dataStr = JSON.stringify(
      { containers, bookmarks, articles },
      null,
      2
    ); // Include articles in export
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
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (
          data &&
          Array.isArray(data.containers) &&
          Array.isArray(data.bookmarks)
        ) {
          const confirmed = await showModal(
            "Isso irá substituir todos os seus favoritos e categorias atuais. Deseja continuar?",
            "Confirmar Importação",
            [
              { text: "Cancelar", class: "secondary", value: false },
              { text: "Continuar", class: "primary", value: true },
            ]
          );
          if (confirmed) {
            containers = data.containers;
            bookmarks = data.bookmarks;
            articles = data.articles || []; // Import articles if available
            saveData();
            render();
          }
        } else {
          await showModal("Arquivo de backup inválido.", "Erro");
        }
      } catch (error) {
        await showModal(
          "Erro ao ler o arquivo. Certifique-se de que é um backup válido.",
          "Erro na Importação"
        );
        console.error("Erro na importação:", error);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  });

  layoutToggleBtn.addEventListener("click", toggleLayout);
  themeToggleBtn.addEventListener("click", toggleTheme);

  const populateMobileMenu = () => {
    const createMenuItem = (text, iconSvg, clickHandler) => {
      const item = document.createElement("button");
      item.className =
        "w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700";
      item.innerHTML = `<div class="w-6 h-6 flex items-center justify-center">${iconSvg}</div><span>${text}</span>`;
      item.addEventListener("click", () => {
        clickHandler();
        mobileMenuDropdown.classList.add("hidden");
      });
      return item;
    };

    const themeIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"></circle><path d="M12 2v2"></path><path d="M12 20v2"></path><path d="m4.93 4.93 1.41 1.41"></path><path d="m17.66 17.66 1.41 1.41"></path><path d="M2 12h2"></path><path d="M20 12h2"></path><path d="m6.34 17.66-1.41 1.41"></path><path d="m19.07 4.93-1.41 1.41"></path></svg>`;
    const layoutIconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="3" y1="9" x2="21" y2="9"></line><line x1="9" y1="21" x2="9" y2="9"></line></svg>`;

    const menuItems = [
      { text: "Alterar Tema", handler: toggleTheme, icon: themeIconSvg },
      { text: "Alterar Layout", handler: toggleLayout, icon: layoutIconSvg },
      {
        text: "Importar Favoritos",
        handler: () => importBtn.click(),
        icon: importBtn.innerHTML,
      },
      {
        text: "Salvar Favoritos",
        handler: () => exportBtn.click(),
        icon: exportBtn.innerHTML,
      },
    ];

    mobileMenuItemsContainer.innerHTML = "";
    menuItems.forEach((itemInfo) => {
      const item = createMenuItem(
        itemInfo.text,
        itemInfo.icon,
        itemInfo.handler
      );
      mobileMenuItemsContainer.appendChild(item);
    });
  };

  mobileMenuBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    mobileMenuDropdown.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (!mobileMenuBtn.contains(e.target)) {
      mobileMenuDropdown.classList.add("hidden");
    }
  });

  mobileMenuDropdown.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  // --- INICIALIZAÇÃO ---
  loadData();
  applyLayout();
  updateSearchEngineUI();
  applyTheme();
  setTimeout(() => renderNavButtons(), 100);
  setTimeout(() => {
    populateMobileMenu();
  }, 2000);
  webSearchBar.focus();
});

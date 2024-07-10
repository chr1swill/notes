const allFolders = (function () {
    /**
     * @typedef {Object} Folder
     * @property {number} id 
     * @property {string} name
     * @property {Array<number>} notesInFolder
     */

    /**
     * @returns{number}
     */
    function createFolderId() {
        return Date.now() + Math.random();
    }

    /**
     * @typedef { { [key: number]: Folder } } FolderCollection - the number used to index into the Folder will be its corisponsing id
     */


    /**
     * @returns {FolderCollection | null}
     */
    function getActiveFoldersFromLocalStorage() {
        const allFolders = localStorage.getItem("folderCollection");
        if (allFolders === null) {
            console.debug("Attempting to initalized folderCollection key in localStorage with empty object");
            /**@type{FolderCollection}*/
            const initFolderCollection = {};

            try {
                localStorage.setItem("folderCollection", JSON.stringify(initFolderCollection));
            } catch (e) {
                console.error(e);
                return null;
            }

            console.debug("Successfully initalized folderCollection key in localStorage with empty object");
            return initFolderCollection;
        }

        return JSON.parse(allFolders);
    }

    /**
     * @param {Folder} folder - the folder you would like to save to localStorage
     * @returns {Folder | null}
     */
    function saveFolderToLocalStorage(folder) {
        const allActiveFolders = getActiveFoldersFromLocalStorage();
        if (allActiveFolders === null) {
            console.error("Failed to access active Folder from localStorage: an error occurred trying to init key folderCollection in localStorage");
            return null;
        }

        allActiveFolders[folder.id] = folder;
        const updatedFoldersAsString = JSON.stringify(allActiveFolders);

        try {
            localStorage.setItem("folderCollection", updatedFoldersAsString);
        } catch (e) {
            console.error(e);
            return null;
        }

        return folder;
    }

    /**
     * @param {string} name - the choosen name of the folder
     * @returns {Folder | null}
     */
    function createFolder(name) {
        name = name.trim();

        if (name.length < 1) {
            console.error("Invalid name, name must contain atleast one character");
            return null;
        }

        if (name.length > 125) {
            console.warn("Provided name was too long, truncated input to 125 chars");
            const indexOfCharNumber125 = 124;
            name = name.slice(0, indexOfCharNumber125);
        }
        console.assert(name.length < 125 && name.length > 0, "The folder name is currently an invalid length");

        if (localStorage.getItem(name) !== null) {
            console.error("Chossen folder name already exist in storage, select a new name");
            return null;
        }

        /**@type{Folder}*/
        const newFolder = {
            id: createFolderId(),
            name: name,
            notesInFolder: []
        }

        const savedFolder = saveFolderToLocalStorage(newFolder);
        if (savedFolder === null) {
            console.error("Could not save your newly created folder to localStorage");
            return null;
        }

        return newFolder;
    }

    function renderFolderListToDOM() {
        const folderListContainer = /**@type{HTMLUListElement | null} */
            (document.getElementById("folder_list_container"));
        if (folderListContainer === null) {
            console.error("Could not not find element with id: #folder_list_container");
            return;
        }

        const fragment = new DocumentFragment();

        const allActiveFolder = getActiveFoldersFromLocalStorage();
        if (allActiveFolder === null) {
            console.error("Failed to access all active folder");
            return;
        }

        for (const folder in allActiveFolder) {
            const li = document.createElement("li");
            const a = document.createElement("a");

            a.textContent = allActiveFolder[folder].name;
            a.setAttribute("data-folder-name", allActiveFolder[folder].id.toString());
            a.setAttribute("href", `${window.location.origin + "/folder-view/folder?id=" + allActiveFolder[folder].id.toString()}`);

            li.appendChild(a);
            fragment.appendChild(li);
        }

        while (folderListContainer.firstChild) {
            folderListContainer.removeChild(folderListContainer.firstChild);
        }

        folderListContainer.appendChild(fragment);
    }

    function main() {
        window.onload = renderFolderListToDOM;
    }

    return { main: main }
})();

allFolders.main();

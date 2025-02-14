document.addEventListener('DOMContentLoaded', function() {
  const originalWordInput = document.getElementById('originalWord');
  const replacementWordInput = document.getElementById('replacementWord');
  const addButton = document.getElementById('addButton');
  const wordList = document.getElementById('wordList');
  const exportButton = document.getElementById('exportButton');
  const importButton = document.getElementById('importButton');
  const importFile = document.getElementById('importFile');
  const searchInput = document.getElementById('searchInput');

  function saveWords(replacements) {
    chrome.storage.sync.set({ replacements });
  }

  function updateWordList(replacements, filter = '') {
    wordList.innerHTML = '';
    for (const [original, replacement] of Object.entries(replacements)) {
      if (filter && !original.toLowerCase().includes(filter.toLowerCase()) && !replacement.toLowerCase().includes(filter.toLowerCase())) {
        continue;
      }
      const li = document.createElement('li');

      const originalInput = document.createElement('input');
      originalInput.type = 'text';
      originalInput.value = original;
      originalInput.dataset.key = original;

      const replacementInput = document.createElement('input');
      replacementInput.type = 'text';
      replacementInput.value = replacement;
      replacementInput.dataset.key = original;

      const saveButton = document.createElement('button');
      saveButton.textContent = 'Save';
      saveButton.addEventListener('click', () => {
        const newOriginal = originalInput.value.trim();
        const newReplacement = replacementInput.value.trim();
        if (newOriginal && newReplacement) {
          delete replacements[original];
          replacements[newOriginal] = newReplacement;
          saveWords(replacements);
          updateWordList(replacements, searchInput.value.trim());
        }
      });

      const deleteButton = document.createElement('button');
      deleteButton.textContent = 'Delete';
      deleteButton.addEventListener('click', () => {
        delete replacements[original];
        saveWords(replacements);
        updateWordList(replacements, searchInput.value.trim());
      });

      originalInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          saveButton.click();
        }
      });

      replacementInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
          saveButton.click();
        }
      });

      li.appendChild(originalInput);
      li.appendChild(replacementInput);
      li.appendChild(saveButton);
      li.appendChild(deleteButton);
      wordList.appendChild(li);
    }
  }

  chrome.storage.sync.get('replacements', (data) => {
    const replacements = data.replacements || {};
    updateWordList(replacements);

    addButton.addEventListener('click', () => {
      const original = originalWordInput.value.trim();
      const replacement = replacementWordInput.value.trim();
      if (original && replacement) {
        replacements[original] = replacement;
        saveWords(replacements);
        updateWordList(replacements, searchInput.value.trim());
        originalWordInput.value = '';
        replacementWordInput.value = '';
      }
    });

    originalWordInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        addButton.click();
      }
    });

    replacementWordInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        addButton.click();
      }
    });

    exportButton.addEventListener('click', () => {
      const csvContent = "data:text/csv;charset=utf-8,"
        + Object.entries(replacements).map(e => e.join(",")).join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', 'replacements.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    });

    importButton.addEventListener('click', () => {
      importFile.click();
    });

    importFile.addEventListener('change', (event) => {
      const file = event.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
          const csv = e.target.result;
          const lines = csv.split("\n");
          const newReplacements = {};
          for (const line of lines) {
            const [original, replacement] = line.split(",");
            if (original && replacement) {
              newReplacements[original.trim()] = replacement.trim();
            }
          }
          saveWords(newReplacements);
          updateWordList(newReplacements, searchInput.value.trim());
        };
        reader.readAsText(file);
      }
    });

    searchInput.addEventListener('input', () => {
      updateWordList(replacements, searchInput.value.trim());
    });
  });
});

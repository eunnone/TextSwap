// Function to replace words in the document
function replaceWords(replacements) {
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
  let node;
  while (node = walker.nextNode()) {
    let text = node.nodeValue;
    for (let [original, replacement] of Object.entries(replacements)) {
      text = text.replace(new RegExp(original, 'gi'), replacement);
    }
    node.nodeValue = text;
  }
}

// Fetch replacements from Chrome storage and apply them
chrome.storage.sync.get('replacements', (data) => {
  const replacements = data.replacements || {};
  replaceWords(replacements);
});

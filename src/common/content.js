chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "showSummary" || request.action === "showError") {
        showSidebar(request.summary || request.error);
    }
});

function showSidebar(content) {
    let sidebar = document.getElementById('ai-summary-sidebar');
    if (!sidebar) {
        sidebar = document.createElement('div');
        sidebar.id = 'ai-summary-sidebar';
        sidebar.style.cssText = `
      position: fixed;
      top: 0;
      right: 0;
      width: 300px;
      height: 100%;
      background: white;
      box-shadow: -2px 0 5px rgba(0,0,0,0.2);
      z-index: 1000;
      padding: 20px;
      overflow-y: auto;
    `;
        document.body.appendChild(sidebar);
    }

    sidebar.innerHTML = `
    <h2>Summary</h2>
    <p>${content}</p>
    <button id="close-sidebar">Close</button>
  `;

    document.getElementById('close-sidebar').addEventListener('click', () => {
        sidebar.remove();
    });
}

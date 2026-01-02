const saveOptions = () => {
  const settings = {
    enable_floater: document.getElementById('enable_floater').checked,
    enable_context: document.getElementById('enable_context').checked,
    enable_autoname: document.getElementById('enable_autoname').checked
  };

  chrome.storage.sync.set(settings, () => {
    const status = document.getElementById('status');
    status.textContent = 'Settings Synchronized. Refresh page to apply.';
    setTimeout(() => { status.textContent = ''; }, 2000);
  });
};

const restoreOptions = () => {
  chrome.storage.sync.get({
    enable_floater: true,
    enable_context: true,
    enable_autoname: true
  }, (items) => {
    document.getElementById('enable_floater').checked = items.enable_floater;
    document.getElementById('enable_context').checked = items.enable_context;
    document.getElementById('enable_autoname').checked = items.enable_autoname;
  });
};

document.addEventListener('DOMContentLoaded', restoreOptions);
document.querySelectorAll('input').forEach(el => el.addEventListener('change', saveOptions));

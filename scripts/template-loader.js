function loadTemplate(targetId, templatePath) {
    fetch(templatePath)
        .then(res => res.text())
        .then(html => {
            document.getElementById(targetId).innerHTML = html;
        })
        .catch(err => console.error(`Error loading ${templatePath}:`, err));
}

// Example usage:
document.addEventListener("DOMContentLoaded", function () {

    if (document.getElementById('basic-form-template-placeholder')) {
        loadTemplate('basic-form-template-placeholder', 'templates/basic-form-template.html');
    }

    if (document.getElementById('form-placeholder')) {
        loadTemplate('form-placeholder', 'templates/form-template.html');
    }

    if (document.getElementById('signup-placeholder')) {
        loadTemplate('signup-placeholder', 'templates/signup-template.html');
    }


    if (document.getElementById('signup-form-placeholder')) {
        loadTemplate('signup-form-placeholder', 'templates/signup-form-template.html');
    }
});

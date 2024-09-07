document.addEventListener('DOMContentLoaded', () => {
  class 
  class Element {
    constructor(e) {
      this.reference = e;
    }
    show() {}
    hide() {}
    makeActive() {}
    makeInactive() {}
  }
    const elements = {
        listItems: document.querySelectorAll('.list-section li'),
        mainImage: document.getElementById('main-image'),
        imgCaption: document.getElementById('caption'),
        loadingSpinner: document.getElementById('loading-spinner'),
        themeToggle: document.getElementById('theme-toggle'),
        topcoatStylesheet: document.getElementById('topcoat-stylesheet')
    };

    let currentIndex = 0;
    let startX = 0;

    function initialize() {
        loadThemeFromLocalStorage();
        addEventListeners();
        addKeyboardNavigation();
        addTouchSupport();
        addLazyLoading();
        addThemeToggle();
    }

    function addEventListeners() {
        addResizeListener();
        elements.listItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                updateActiveItem(index);
                updateImage(item.getAttribute('data-image'));
            });
            item.addEventListener('focus', () => {
                updateActiveItem(index);
            });
        });
    }

    function getSavedTheme() {
        try {
            return localStorage.getItem('theme');
        } catch (error) {
            console.error('Failed to access localStorage', error);
            return null;
        }
    }

    function removeClass(e, className) {
        e.classList.remove(className);
    }

    function addClass(e, className) {
        e.classList.add(className);
    }

    function getTheme() {
        return document.body.getAttribute('data-bs-theme');
    }

    function hideElement(e) {
        e.classList.add('d-none');
    }

    function showElement(e) {
        e.classList.remove('d-none');
    }

    function showSpinner() {
        showElement(elements.loadingSpinner);
    }

    function hideSpinner() {
        hideElement(elements.loadingSpinner);
    }

    function getDeviceType() {
        return window.innerWidth >= 768 ? 'desktop' : 'mobile';
    }

    function applyTopcoat(mode = 'dark') {
        const deviceType = getDeviceType();
        const stylesheet = `./css/topcoat-${deviceType}-${mode}.min.css`;
console.log(stylesheet);
        if (elements.topcoatStylesheet) {
            elements.topcoatStylesheet.href = stylesheet;
        } else {
            const newLinkElement = document.createElement('link');
            newLinkElement.id = 'topcoat-stylesheet';
            newLinkElement.rel = 'stylesheet';
            newLinkElement.href = stylesheet;
            document.head.appendChild(newLinkElement);
        }
    }

    const makeActiveElement = e => e.classList.add('active');
    const makeInactiveElement = e => e.classList.remove('active');
    
    function updateActiveItem(index) {
        const previouslyActive = document.querySelector('.list-section li.active');
        (previouslyActive) && makeInactiveElement(previouslyActive);
        makeActiveElement(elements.listItems[index]);
        currentIndex = index;
    }

    function updateImage(src) {
        showSpinner();
        elements.mainImage.style.opacity = 0;
        elements.mainImage.style.transform = 'scale(0.95)';
        setTimeout(() => {
            elements.mainImage.setAttribute('src', src);
            elements.mainImage.setAttribute('alt', src);
            elements.imgCaption.innerHTML = src;
            elements.mainImage.style.opacity = 1;
            elements.mainImage.style.transform = 'scale(1)';
        }, 100);
        showElement(elements.mainImage);
        elements.mainImage.onload = hideSpinner;
        elements.mainImage.onerror = () => {
            handleError(src);
            hideSpinner();
        };
    }

    function handleError(src) {
        console.error(`Failed to load image: ${src}`);
        alert(`Image "${src}" could not be loaded. Please check the file path.`);
    }

    function addKeyboardNavigation() {
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'ArrowUp':
                    navigateList('up');
                    break;
                case 'ArrowDown':
                    navigateList('down');
                    break;
                case 'Enter':
                    updateImage(elements.listItems[currentIndex].getAttribute('data-image'));
                    break;
            }
        });
    }

    function navigateList(direction) {
        if (direction === 'up' && currentIndex > 0) {
            updateActiveItem(currentIndex - 1);
            elements.listItems[currentIndex].focus();
        } else if (direction === 'down' && currentIndex < elements.listItems.length - 1) {
            updateActiveItem(currentIndex + 1);
            elements.listItems[currentIndex].focus();
        }
    }

    function addTouchSupport() {
            const handleTouchStart = event => {
        startX = event.touches[0].clientX;
    }

    const handleTouchMove = event => {
        const diffX = startX - event.touches[0].clientX;
        if (Math.abs(diffX) > 50) {
            navigateList(diffX > 0 ? 'down' : 'up');
            startX = 0;
        }
    }
        document.addEventListener('touchstart', handleTouchStart, false);
        document.addEventListener('touchmove', handleTouchMove, false);
    }

    function addLazyLoading() {
        if ('IntersectionObserver' in window) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const imgElement = entry.target;
                        const src = imgElement.getAttribute('data-src');
                        if (src) {
                            imgElement.setAttribute('src', src);
                            imgElement.onload = () => {
                                imgElement.removeAttribute('data-src');
                                hideSpinner();
                            };
                            imgElement.onerror = () => handleError(src);
                        }
                        observer.unobserve(imgElement);
                    }
                });
            });
            elements.listItems.forEach(item => {
                const imgElement = document.createElement('img');
                imgElement.setAttribute('data-src', item.getAttribute('data-image'));
                observer.observe(imgElement);
            });
        } else {
            elements.listItems.forEach(item => {
                const imgElement = document.createElement('img');
                imgElement.setAttribute('src', item.getAttribute('data-image'));
                imgElement.onerror = () => handleError(item.getAttribute('data-image'));
                item.appendChild(imgElement);
            });
        }
    }

    function addResizeListener() {
        window.addEventListener('resize', () => {
            const currentTheme = getTheme();
            applyTopcoat(currentTheme);
        });
    }
  
    function addThemeToggle() {
        elements.themeToggle.addEventListener('click', () => {
            const currentTheme = getTheme();
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.body.setAttribute('data-bs-theme', newTheme);
            applyTopcoat(newTheme);
            try {
                localStorage.setItem('theme', newTheme);
            } catch (error) {
                console.error('Failed to save theme to localStorage', error);
            }
        });
    }

    function loadThemeFromLocalStorage() {
        const savedTheme = getSavedTheme();
        if (savedTheme) {
            document.body.setAttribute('data-bs-theme', savedTheme);
            applyTopcoat(savedTheme);
        }
    }

    initialize();
});

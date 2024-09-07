document.addEventListener('DOMContentLoaded', () => {
  class ElementHandler {
    constructor(element) {
      this.element = element;
    }

    show() {
      if (this.element) {
        this.element.classList.remove('d-none');
      }
    }

    hide() {
      if (this.element) {
        this.element.classList.add('d-none');
      }
    }

    makeActive() {
      if (this.element) {
        this.element.classList.add('active');
      }
    }

    makeInactive() {
      if (this.element) {
        this.element.classList.remove('active');
      }
    }
  }

  class ImageManager {
    constructor(mainImage, caption, spinner) {
      this.mainImage = new ElementHandler(mainImage);
      this.caption = new ElementHandler(caption);
      this.spinner = new ElementHandler(spinner);
    }

    updateImage(src) {
      try {
        this.spinner.show();
        this._fadeOutImage();

        setTimeout(() => {
          this.mainImage.element.setAttribute('src', src);
          this.mainImage.element.setAttribute('alt', src);
          this.caption.element.textContent = src;

          this._fadeInImage();
          this.mainImage.show();
          this.mainImage.element.onload = () => this.spinner.hide();
          this.mainImage.element.onerror = () => this.handleError(src);
        }, 100);
      } catch (error) {
        console.error('Error updating image:', error);
      }
    }

    _fadeOutImage() {
      this.mainImage.element.style.opacity = 0;
      this.mainImage.element.style.transform = 'scale(0.95)';
    }

    _fadeInImage() {
      this.mainImage.element.style.opacity = 1;
      this.mainImage.element.style.transform = 'scale(1)';
    }

    handleError(src) {
      console.error(`Failed to load image: ${src}`);
      alert(`Image "${src}" could not be loaded. Please check the file path.`);
      this.spinner.hide();
    }
  }

  class ThemeManager {
    constructor(themeToggle, stylesheet) {
      this.themeToggle = new ElementHandler(themeToggle);
      this.stylesheet = stylesheet;
    }

    applyTheme(mode = 'dark') {
      try {
        const deviceType = window.innerWidth >= 768 ? 'desktop' : 'mobile';
        const stylesheetURL = `./css/topcoat-${deviceType}-${mode}.min.css`;

        if (this.stylesheet) {
          this.stylesheet.href = stylesheetURL;
        } else {
          const newLinkElement = document.createElement('link');
          newLinkElement.id = 'topcoat-stylesheet';
          newLinkElement.rel = 'stylesheet';
          newLinkElement.href = stylesheetURL;
          document.head.appendChild(newLinkElement);
        }
      } catch (error) {
        console.error('Error applying theme:', error);
      }
    }

    toggleTheme() {
      this.themeToggle.element.addEventListener('click', () => {
        try {
          const currentTheme = document.body.getAttribute('data-bs-theme');
          const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
          document.body.setAttribute('data-bs-theme', newTheme);
          this.applyTheme(newTheme);

          localStorage.setItem('theme', newTheme);
        } catch (error) {
          console.error('Failed to toggle theme or save to localStorage:', error);
        }
      });
    }
  }

  class App {
    constructor(elements) {
      this.elements = elements;
      this.imageManager = new ImageManager(elements.mainImage, elements.imgCaption, elements.loadingSpinner);
      this.themeManager = new ThemeManager(elements.themeToggle, elements.topcoatStylesheet);
      this.currentIndex = 0;
      this.startX = 0;
    }

    initialize() {
      this.loadThemeFromLocalStorage();
      this.addEventListeners();
      this.addKeyboardNavigation();
      this.addTouchSupport();
      this.addLazyLoading();
      this.themeManager.toggleTheme();
    }

    addEventListeners() {
      window.addEventListener('resize', () => this.themeManager.applyTheme());
      this.elements.listItems.forEach((item, index) => {
        item.addEventListener('click', () => {
          this.updateActiveItem(index);
          this.imageManager.updateImage(item.getAttribute('data-image'));
        });
        item.addEventListener('focus', () => this.updateActiveItem(index));
      });
    }

    addKeyboardNavigation() {
      document.addEventListener('keydown', (event) => {
        switch (event.key) {
          case 'ArrowUp':
            this.navigateList('up');
            break;
          case 'ArrowDown':
            this.navigateList('down');
            break;
          case 'Enter':
            this.imageManager.updateImage(this.elements.listItems[this.currentIndex].getAttribute('data-image'));
            break;
        }
      });
    }

    navigateList(direction) {
      if (direction === 'up' && this.currentIndex > 0) {
        this.updateActiveItem(this.currentIndex - 1);
        this.elements.listItems[this.currentIndex].focus();
      } else if (direction === 'down' && this.currentIndex < this.elements.listItems.length - 1) {
        this.updateActiveItem(this.currentIndex + 1);
        this.elements.listItems[this.currentIndex].focus();
      }
    }

    addTouchSupport() {
      document.addEventListener('touchstart', (event) => (this.startX = event.touches[0].clientX), false);
      document.addEventListener('touchmove', (event) => {
        const diffX = this.startX - event.touches[0].clientX;
        if (Math.abs(diffX) > 50) {
          this.navigateList(diffX > 0 ? 'down' : 'up');
          this.startX = 0;
        }
      }, false);
    }

    addLazyLoading() {
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
                  this.imageManager.spinner.hide();
                };
                imgElement.onerror = () => this.imageManager.handleError(src);
              }
              observer.unobserve(imgElement);
            }
          });
        });
        this.elements.listItems.forEach(item => {
          const imgElement = document.createElement('img');
          imgElement.setAttribute('data-src', item.getAttribute('data-image'));
          observer.observe(imgElement);
        });
      } else {
        this.elements.listItems.forEach(item => {
          const imgElement = document.createElement('img');
          imgElement.setAttribute('src', item.getAttribute('data-image'));
          imgElement.onerror = () => this.imageManager.handleError(item.getAttribute('data-image'));
          item.appendChild(imgElement);
        });
      }
    }

    updateActiveItem(index) {
      try {
        const previouslyActive = document.querySelector('.list-section li.active');
        previouslyActive && previouslyActive.classList.remove('active');
        this.elements.listItems[index].classList.add('active');
        this.currentIndex = index;
      } catch (error) {
        console.error('Error updating active item:', error);
      }
    }

    loadThemeFromLocalStorage() {
      try {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
          document.body.setAttribute('data-bs-theme', savedTheme);
          this.themeManager.applyTheme(savedTheme);
        }
      } catch (error) {
        console.error('Failed to load theme from localStorage:', error);
      }
    }
  }

  const elements = {
    listItems: document.querySelectorAll('.list-section li'),
    mainImage: document.getElementById('main-image'),
    imgCaption: document.getElementById('caption'),
    loadingSpinner: document.getElementById('loading-spinner'),
    themeToggle: document.getElementById('theme-toggle'),
    topcoatStylesheet: document.getElementById('topcoat-stylesheet')
  };

  const app = new App(elements);
  app.initialize();
});

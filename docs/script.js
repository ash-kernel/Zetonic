// Landing page interactions for Zetonic
document.addEventListener('DOMContentLoaded', () => {
  // Intersection Observer for animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
      }
    });
  }, observerOptions);

  // Observe all animated elements
  document.querySelectorAll('[data-animate]').forEach(el => {
    observer.observe(el);
  });

  // Copy install command button
  const copyPsBtn = document.getElementById('copyPsBtn');
  if (copyPsBtn) {
    copyPsBtn.addEventListener('click', () => {
      const command = 'irm https://raw.githubusercontent.com/ash-kernel/Zetonic/main/install-auto.ps1 | iex';
      navigator.clipboard.writeText(command).then(() => {
        showToast('Copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    });
  }

  // Copy code button
  const copyCodeBtn = document.getElementById('copyCode');
  const psCommand = document.getElementById('psCommand');
  if (copyCodeBtn && psCommand) {
    copyCodeBtn.addEventListener('click', () => {
      const code = psCommand.textContent;
      navigator.clipboard.writeText(code).then(() => {
        copyCodeBtn.textContent = 'Copied!';
        setTimeout(() => {
          copyCodeBtn.textContent = 'Copy';
        }, 2000);
      }).catch(err => {
        console.error('Failed to copy:', err);
      });
    });
  }

  // Smooth scroll for navigation links
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // Toast notification
  function showToast(message) {
    const toast = document.getElementById('toast');
    if (toast) {
      toast.textContent = message;
      toast.style.display = 'block';
      setTimeout(() => {
        toast.style.display = 'none';
      }, 2000);
    }
  }
});

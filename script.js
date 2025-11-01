function safeAddListenerById(id, event, handler) {
  const el = document.getElementById(id);
  if (el) el.addEventListener(event, handler);
  else console.warn(`Không tìm thấy phần tử #${id}`);
}

// Hàm tiện ích để lấy tham số từ URL (dùng cho trang edit.html)
function getUrlParameter(name) {
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    const regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    const results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
}

// Hàm tiện ích để lấy memberId từ tên file hiện tại 
function getMemberIdFromFileName() {
    const path = window.location.pathname;
    const fileName = path.split('/').pop(); 
    // Chỉ xử lý các file portfolio cá nhân, bỏ qua index.html và edit.html
    if (fileName && fileName.endsWith('.html') && fileName !== 'index.html' && fileName !== 'edit.html') {
        return fileName.replace('.html', ''); // Ví dụ: trả về "viet"
    }
    return null;
}

// Hàm tải nội dung từ Local Storage và áp dụng cho trang Portfolio cá nhân
function loadPortfolioContent(memberId) {
    if (!memberId) return;
    const pageKey = 'portfolio_content_' + memberId;
    const savedContent = localStorage.getItem(pageKey);
    const mainContent = document.querySelector('main.container');

    if (savedContent && mainContent) {
        mainContent.innerHTML = savedContent; 
        
        // Đảm bảo các phần tử chỉnh sửa bị tắt trên trang xem
        mainContent.querySelectorAll('[contenteditable]').forEach(el => {
            el.removeAttribute('contenteditable');
        });
    }
}

// --- LOGIC CHÍNH ---
document.addEventListener('DOMContentLoaded', () => {
    // 1. Tải nội dung cho trang portfolio cá nhân
    const memberIdForView = getMemberIdFromFileName();
    if (memberIdForView) {
        loadPortfolioContent(memberIdForView);
    }

    // 2. Logic cho trang chỉnh sửa (edit.html)
    const memberIdForEdit = getUrlParameter('member'); 
    const mainContent = document.querySelector('main.container');

    if (memberIdForEdit && mainContent) {
        const pageKey = 'portfolio_content_' + memberIdForEdit;
        const viewPageLink = document.getElementById('view-page-link'); 
        const saveAllBtn = document.getElementById('save-all-btn');
        const resetBtn = document.getElementById('reset-btn');
        const editHeaderTitle = document.getElementById('edit-header-title');

        if (editHeaderTitle) {
            editHeaderTitle.textContent = `CHẾ ĐỘ CHỈNH SỬA: ${memberIdForEdit.toUpperCase()}`;
        }
        
       if (viewPageLink) {
            // Đảm bảo liên kết chuyển hướng chính xác
            viewPageLink.href = memberIdForEdit + '.html'; 
        }

        if (editHeaderTitle) {
            editHeaderTitle.textContent = `CHẾ ĐỘ CHỈNH SỬA: ${memberIdForEdit.toUpperCase()}`; // <--- XÓA/CHÚ THÍCH DÒNG NÀY
        }

        // TẢI DỮ LIỆU ĐÃ LƯU KHI VÀO TRANG CHỈNH SỬA
        const savedContent = localStorage.getItem(pageKey);
        if (savedContent) {
            mainContent.innerHTML = savedContent;
        }

        // Đảm bảo các phần tử có thể chỉnh sửa sau khi tải dữ liệu
        mainContent.querySelectorAll('.editable-section *').forEach(el => {
            // Kiểm tra và bật contenteditable chỉ khi nó đã được cấu hình trong edit.html
            if (el.hasAttribute('contenteditable')) {
                el.setAttribute('contenteditable', 'true');
            }
        });
        
        // Xử lý nút LƯU
        if (saveAllBtn && viewPageLink) {
            saveAllBtn.addEventListener('click', () => {
                // 1. LƯU TOÀN BỘ nội dung MAIN vào Local Storage
                localStorage.setItem(pageKey, mainContent.innerHTML); 
                
                console.log(`✅ Đã lưu Portfolio của ${memberIdForEdit} vào bộ nhớ tạm thời của trình duyệt. Đang chuyển hướng đến: ${viewPageLink.href}`);
                
                // 2. Tự động chuyển hướng ngay lập tức (KHÔNG DÙNG setTimeout)
                window.location.href = viewPageLink.href; 
            });
        }
        
        // Xử lý nút KHÔI PHỤC
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                const confirmed = confirm(`⚠️ Bạn có chắc muốn khôi phục Portfolio của ${memberIdForEdit} về trạng thái gốc không?`);
                if (confirmed) {
                    localStorage.removeItem(pageKey);
                    alert("Đã khôi phục về trạng thái gốc! Vui lòng tải lại trang.");
                    // Tải lại trang để áp dụng nội dung gốc
                    window.location.reload(); 
                }
            });
        }
    }

    // Logic chung
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', e => {
            if (link.getAttribute('href').startsWith('#')) {
                e.preventDefault();
                const sectionId = link.getAttribute('href');
                const section = document.querySelector(sectionId);
                if (section) section.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    function handleFadeInOnScroll() {
        const fadeElements = document.querySelectorAll('.member-card, .project-card');
        fadeElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight - 100) {
                el.classList.add('fade-in');
            }
        });
    }
    window.addEventListener('scroll', handleFadeInOnScroll);
    handleFadeInOnScroll(); 

    const navbar = document.querySelector('.navbar');
    // Kiểm tra xem có phải là trang cá nhân (small header) hay không
    const isSmallHeader = document.querySelector('.header.small'); 

    window.addEventListener('scroll', () => {
        if (!navbar) return;
        if (window.scrollY > 60) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // Ẩn thanh điều hướng ở trang cá nhân khi cuộn (trang cá nhân sử dụng .header.small)
    if (isSmallHeader) {
        document.querySelector('.header.small').classList.remove('scrolled');
    }
});

document.addEventListener('DOMContentLoaded', () => {

    // === CODE 1: HIỆU ỨNG LÁ RƠI BẰNG CANVAS ===
    const canvas = document.getElementById('falling-leaves');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let leaves = [];
        const NUM_LEAVES = 30;
        
        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas(); 

        function createLeaf() {
            const x = Math.random() * canvas.width; 
            const y = Math.random() * canvas.height; 
            const size = Math.random() * 15 + 10; 
            const speed = Math.random() * 2 + 0.5; 
            const wobble = Math.random() * 0.05 + 0.02; 
            const wobbleMagnitude = Math.random() * 20 + 10; 
            const opacity = Math.random() * 0.6 + 0.3; 
            const rotationSpeed = Math.random() * 0.05 - 0.025; 
            const color = `hsl(${Math.random() * 30 + 30}, 80%, ${Math.random() * 20 + 50}%)`; 

            return {
                x: x,
                y: y,
                size: size,
                speed: speed,
                wobble: wobble,
                wobbleMagnitude: wobbleMagnitude,
                opacity: opacity,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: rotationSpeed,
                startAngle: Math.random() * Math.PI * 2,
                color: color
            };
        }

        for (let i = 0; i < NUM_LEAVES; i++) {
            leaves.push(createLeaf());
        }

        function drawLeaf(leaf) {
            ctx.save(); 
            ctx.translate(leaf.x, leaf.y); 
            ctx.rotate(leaf.rotation); 

            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.bezierCurveTo(leaf.size / 2, -leaf.size, leaf.size, -leaf.size / 2, leaf.size, leaf.size / 2);
            ctx.bezierCurveTo(leaf.size / 2, leaf.size, 0, leaf.size * 1.5, 0, leaf.size);
            ctx.bezierCurveTo(-leaf.size / 2, leaf.size, -leaf.size, leaf.size / 2, -leaf.size, -leaf.size / 2);
            ctx.bezierCurveTo(-leaf.size / 2, -leaf.size, 0, 0, 0, 0);
            ctx.closePath();

            ctx.fillStyle = leaf.color;
            ctx.globalAlpha = leaf.opacity; 
            ctx.fill();

            ctx.restore(); 
            ctx.globalAlpha = 1; 
        }

        function updateLeaves() {
            for (let i = 0; i < leaves.length; i++) {
                const leaf = leaves[i];

                leaf.y += leaf.speed;
                leaf.x += Math.sin(leaf.startAngle + leaf.y * leaf.wobble) * leaf.wobbleMagnitude * (leaf.speed / 5);
                leaf.rotation += leaf.rotationSpeed;

                if (leaf.y > canvas.height + leaf.size || leaf.x < -leaf.size * 2 || leaf.x > canvas.width + leaf.size * 2) {
                    leaves[i] = createLeaf();
                    leaves[i].y = -leaf.size; 
                }
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height); 
            updateLeaves(); 
            leaves.forEach(drawLeaf); 

            requestAnimationFrame(animate); 
        }

        animate();
    }


    // === CODE 2: HIỆU ỨNG ĐẾM SỐ PHẦN TRĂM KỸ NĂNG ===
    const skillSection = document.getElementById('ky-nang');
    const skillPercentages = document.querySelectorAll('.skill-percentage');
    let skillsAnimated = false;

    function animateCount(element, target) {
        let current = 0;
        const duration = 1500;
        const step = target / (duration / 10); 

        const timer = setInterval(() => {
            current += step;
            if (current >= target) {
                current = target;
                clearInterval(timer);
            }
            element.textContent = `${Math.floor(current)}/100`; 
        }, 10);
    }

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !skillsAnimated) {
                skillPercentages.forEach(span => {
                    const targetValue = parseInt(span.getAttribute('data-target'));
                    animateCount(span, targetValue);
                });
                skillsAnimated = true; 
                observer.unobserve(skillSection);
            }
        });
    }, {
        threshold: 0.5 
    });

    if (skillSection) {
        observer.observe(skillSection);
    }


    // === CODE 3: QUẢN LÝ MODAL POPUP ===
    const modal = document.getElementById('portfolio-modal');
    const closeBtn = document.getElementsByClassName('close-btn')[0];
    const miniCards = document.querySelectorAll('.mini-card');
    const modalTitle = document.getElementById('modal-title');
    const modalDetails = document.querySelectorAll('.modal-detail');

    if (modal) {
        miniCards.forEach(card => {
            card.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                const titleText = this.querySelector('h3').textContent;

                modalDetails.forEach(detail => {
                    detail.classList.add('hidden');
                });
                
                const targetDetail = document.getElementById(targetId);
                if (targetDetail) {
                    targetDetail.classList.remove('hidden');
                }

                modalTitle.textContent = titleText;
                modal.style.display = 'block';
            });
        });

        closeBtn.onclick = function() {
            modal.style.display = 'none';
        }

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        }
    }
});

// Hiệu ứng xuất hiện khi cuộn
    const sections = document.querySelectorAll("section");
    window.addEventListener("scroll", () => {
      sections.forEach(sec => {
        const top = sec.getBoundingClientRect().top;
        if (top < window.innerHeight - 100) {
          sec.classList.add("visible");
        }
      });
    });

     // Nếu bị chặn autoplay, phát khi click đầu tiên
    const music = document.getElementById("bgMusic");
    if (music) {
        music.volume = 0.5;
        document.addEventListener("click", () => {
            if (music.paused) music.play().catch(err => console.log("Autoplay bị chặn:", err));
        });
    }

    // Hiệu ứng thanh kỹ năng khi cuộn
window.addEventListener("scroll", () => {
  document.querySelectorAll(".fill").forEach((bar) => {
    const rect = bar.getBoundingClientRect();
    if (rect.top < window.innerHeight - 100) {
      const width = bar.getAttribute("data-width");
      bar.style.width = width;
    }
  });
});

console.log("Test element:", document.getElementById("contactForm"));
// Gửi form liên hệ (chạy an toàn, không lỗi nếu trang không có form)
const contactForm = document.getElementById("contactForm");
if (contactForm) {
  contactForm.addEventListener("submit", function (e) {
    e.preventDefault();
    alert("💙 Cảm ơn bạn đã liên hệ! Mình sẽ phản hồi sớm nhất có thể.");
    this.reset();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const bars = document.querySelectorAll(".progress");
  const percents = document.querySelectorAll(".percent");

  bars.forEach((bar, i) => {
    const value = parseInt(bar.dataset.value);
    let current = 0;
    const timer = setInterval(() => {
      if (current <= value) {
        bar.style.width = current + "%";
        percents[i].textContent = current + "%";
        current++;
      } else {
        clearInterval(timer);
      }
    }, 20);
  });
});

document.addEventListener("DOMContentLoaded", function() {
    // === LOGIC THANH TIẾN TRÌNH KỸ NĂNG & NGÔN NGỮ ===
    const skillBars = document.querySelectorAll('.cert-fill');

    function animateSkillBars() {
        skillBars.forEach(bar => {
            const rect = bar.getBoundingClientRect();
            // Kích hoạt khi thanh cuộn vào tầm nhìn (100px từ đáy màn hình)
            if (rect.top < window.innerHeight - 100 && rect.bottom > 0) {
                const target = bar.getAttribute('data-percent');
                bar.style.width = target; // Kích hoạt animation CSS
            } else {
                // Đặt lại về 0% khi ra khỏi tầm nhìn để có thể chạy lại
                bar.style.width = '0%';
            }
        });
    }

    // Kích hoạt khi trang tải và khi cuộn
    window.addEventListener('scroll', animateSkillBars);
    animateSkillBars(); // Chạy lần đầu khi load trang


    // === LOGIC BIỂU ĐỒ TRÒN KỸ NĂNG SỐNG (PIE CHART) ===
    const ctx = document.getElementById('lifeSkillsPieChart');
    const skillLabels = document.querySelectorAll('.skill-label');

    // Dữ liệu ban đầu cho biểu đồ (có thể điều chỉnh giá trị)
    const pieChartData = {
        labels: ['Làm việc nhóm', 'Giải quyết vấn đề', 'Giao tiếp', 'Tư duy phản biện'],
        datasets: [{
            data: [25, 25, 25, 25], // Chia đều ban đầu
            backgroundColor: [
                'rgba(14, 165, 233, 0.8)', // Màu xanh
                'rgba(52, 211, 153, 0.8)', // Màu xanh lá
                'rgba(251, 191, 36, 0.8)', // Màu vàng
                'rgba(239, 68, 68, 0.8)'   // Màu đỏ
            ],
            borderColor: '#fff',
            borderWidth: 2,
            hoverOffset: 10 // Độ nổi bật khi hover
        }]
    };

    // Khởi tạo biểu đồ
    const lifeSkillsPieChart = new Chart(ctx, {
        type: 'pie',
        data: pieChartData,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Ẩn legend mặc định của Chart.js
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.label || '';
                            if (label) {
                                label += ': ';
                            }
                            // Hiển thị phần trăm (có thể tùy chỉnh)
                            if (context.parsed !== null) {
                                label += (context.parsed / getTotal(context.dataset.data) * 100).toFixed(0) + '%';
                            }
                            return label;
                        }
                    }
                }
            },
            onClick: (e, elements) => {
                if (elements.length > 0) {
                    const clickedIndex = elements[0].index;
                    togglePieChartSelection(clickedIndex);
                }
            }
        }
    });

    // Hàm tính tổng để hiển thị phần trăm
    function getTotal(data) {
        return data.reduce((a, b) => a + b, 0);
    }

    // Hàm xử lý khi click vào biểu đồ hoặc nhãn
    function togglePieChartSelection(index) {
        // Reset tất cả về trạng thái ban đầu
        lifeSkillsPieChart.data.datasets[0].backgroundColor = pieChartData.datasets[0].backgroundColor;
        lifeSkillsPieChart.data.datasets[0].hoverOffset = 10;
        
        skillLabels.forEach(label => label.classList.remove('active'));

        if (index !== undefined) {
            // Nổi bật phần được chọn
            const newColors = [...pieChartData.datasets[0].backgroundColor];
            const newOffsets = new Array(newColors.length).fill(0); // Đặt lại tất cả offset về 0

            // Tăng độ sáng và đẩy ra ngoài cho phần được chọn
            const originalColor = Chart.helpers.get = Chart.helpers.color(newColors[index]);
            newColors[index] = originalColor.lighten(0.1).rgbString(); // Làm sáng hơn
            newOffsets[index] = 20; // Đẩy ra xa hơn

            lifeSkillsPieChart.data.datasets[0].backgroundColor = newColors;
            lifeSkillsPieChart.data.datasets[0].hoverOffset = newOffsets;

            // Kích hoạt class 'active' cho nhãn tương ứng
            skillLabels[index].classList.add('active');
        }

        lifeSkillsPieChart.update();
    }

    // Xử lý click vào các nhãn dưới biểu đồ
    skillLabels.forEach((label, index) => {
        label.addEventListener('click', () => {
            // Kiểm tra xem nhãn này đã active chưa
            if (label.classList.contains('active')) {
                togglePieChartSelection(undefined); // Bỏ chọn nếu đã active
            } else {
                togglePieChartSelection(index); // Chọn nhãn này
            }
        });
    });
});

// === DỰ ÁN (Project Slider) ===
document.addEventListener("DOMContentLoaded", () => {
  const pSlides = document.querySelectorAll(".viet-page .project-slide");
  const nextP = document.getElementById("nextProject");
  const prevP = document.getElementById("prevProject");

  // Chỉ chạy nếu tồn tại phần tử
  if (pSlides.length && nextP && prevP) {
    let i = 0;

    function showProject(n) {
      pSlides.forEach(slide => slide.classList.remove("active"));
      pSlides[n].classList.add("active");
    }

    nextP.addEventListener("click", () => {
      i = (i + 1) % pSlides.length;
      showProject(i);
    });

    prevP.addEventListener("click", () => {
      i = (i - 1 + pSlides.length) % pSlides.length;
      showProject(i);
    });
  }
});


// === SỞ THÍCH - TỰ ĐỘNG CHUYỂN ẢNH ===
// === CHỈ CHẠY CHO TRANG VIET.HTML ===
function isVietPage() {
  const file = window.location.pathname.split("/").pop().toLowerCase();
  return file === "viet.html";
}

if (isVietPage()) {
  window.addEventListener("load", () => {
    const carousel = document.querySelector(".hobbies-carousel");
    if (!carousel) return;

    const slides = carousel.querySelectorAll(".slide");
    if (!slides.length) return;

    let current = 0;
    const interval = 2000; // 2 giây

    // Hiển thị slide hiện tại
    function showSlide(index) {
      slides.forEach((slide, i) => {
        slide.classList.toggle("active", i === index);
      });
    }

    // Tự động chuyển slide
    setInterval(() => {
      current = (current + 1) % slides.length;
      showSlide(current);
    }, interval);

    // Bắt đầu với slide đầu tiên
    showSlide(current);
    console.log("🎬 Hobbies slideshow started with", slides.length, "slides.");
  });
}

// --- LOGIC TỰ ĐỘNG CHUYỂN SLIDE CHO HOBBIES-CAROUSEL ---
document.addEventListener("DOMContentLoaded", function() {
    const slides = document.querySelectorAll(".hobbies-carousel .slide");
    if (slides.length === 0) return;

    let currentSlide = 0;

    // QUAN TRỌNG: Đảm bảo slide đầu tiên có class 'active'
    // vì bạn đã có class 'active' trong HTML, đoạn này chỉ để phòng ngừa
    if (!slides[0].classList.contains('active')) {
        slides[0].classList.add('active'); 
    }

    function nextSlide() {
        // Loại bỏ class 'active' khỏi slide hiện tại
        slides[currentSlide].classList.remove("active"); 
        
        // Chuyển sang slide kế tiếp (quay lại 0 nếu hết)
        currentSlide = (currentSlide + 1) % slides.length; 
        
        // Thêm class 'active' cho slide mới
        slides[currentSlide].classList.add("active"); 
    }

    // Thiết lập tự động chuyển slide sau mỗi 3 giây
    setInterval(nextSlide, 3000); 
});
/* ==============================
   PHONG PAGE SCRIPT
   ============================== */
function showSection(sectionId) {
  const sections = document.querySelectorAll(".phong-page .content-section");
  sections.forEach(sec => sec.classList.remove("active"));
  const active = document.getElementById(sectionId);
  if (active) active.classList.add("active");
}

// Hiệu ứng thanh kỹ năng (animation khi mở tab kỹ năng)
function animateSkills() {
  const skills = document.querySelectorAll(".phong-page .fill");
  skills.forEach(bar => {
    const target = bar.getAttribute("data-percent") || bar.style.width || "0%";
    bar.style.width = "0";
    setTimeout(() => bar.style.width = target, 300);
  });
}

// ===============================
// PHONG - HIỆU ỨNG THANH KỸ NĂNG
// ===============================
// === LOGIC THANH KỸ NĂNG CHO PHẦN PHONG-PAGE ===
document.addEventListener("DOMContentLoaded", function() {
    const skillFills = document.querySelectorAll('.phong-page .skill .fill');

    if (skillFills.length === 0) return;

    // Gán width 0% ban đầu
    skillFills.forEach(fillBar => {
        fillBar.style.width = '0%'; 
    });

    // Hàm reset về 0% (Để gọi từ showSection)
    window.resetSkills = function() {
        skillFills.forEach(fillBar => {
            fillBar.style.width = '0%';
        });
    }

    // Hàm chạy animation (Để gọi từ showSection)
    window.animateSkills = function() {
        // Reset về 0% trước để hiệu ứng chạy lại mượt mà
        window.resetSkills(); 
        
        // Chạy sau 50ms để trình duyệt có thời gian reset về 0
        setTimeout(() => {
            skillFills.forEach(fillBar => {
                const targetWidth = fillBar.getAttribute('data-percent');
                if (targetWidth) {
                    fillBar.style.width = targetWidth; // Kích hoạt hiệu ứng CSS transition
                }
            });
        }, 50); 
    }
    
    // Đặt lại thanh kỹ năng khi trang tải lần đầu (nếu cần)
    window.resetSkills();
});

// GHI CHÚ QUAN TRỌNG:
// Bạn phải đảm bảo hàm showSection(sectionId) bên dưới được định nghĩa
// Nếu hàm này đã nằm trong script.js, vui lòng sửa nó.
// Nếu nó là global function, bạn chỉ cần sửa logic bên trong.

function showSection(sectionId) {
    // 1. Logic ẩn tất cả section và hiện section được chọn (Rất quan trọng cho nút bấm)
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // 2. Logic Kích hoạt thanh kỹ năng
    if (sectionId === 'skills' && typeof window.animateSkills === 'function') {
        window.animateSkills(); // Chạy thanh kỹ năng khi vào mục Skills
    } else if (typeof window.resetSkills === 'function') {
        window.resetSkills(); // Reset khi chuyển sang mục khác
    }
}

/**
 * YÊU CẦU: JavaScript cho Responsive Menu và Scroll Animation
 * Đảm bảo Clean Code (Yêu cầu phi chức năng)
 */

document.addEventListener('DOMContentLoaded', function() {
    
    // ------------------------------------------------------------------
    // 1. CHỨC NĂNG RESPONSIVE MENU
    // ------------------------------------------------------------------
    
    const menuIcon = document.getElementById('menu-icon');
    const navbar = document.querySelector('.navbar');

    if (menuIcon && navbar) {
        // Toggle menu khi click vào icon
        menuIcon.onclick = () => {
            menuIcon.classList.toggle('fa-times');
            navbar.classList.toggle('active');
        };
        
        // Đóng menu khi click vào một link
        document.querySelectorAll('.navbar a').forEach(link => {
            link.onclick = () => {
                if(navbar.classList.contains('active')) {
                    menuIcon.classList.remove('fa-times');
                    navbar.classList.remove('active');
                }
            };
        });
    }

    // ------------------------------------------------------------------
    // 2. SCROLL ANIMATION (Sử dụng Intersection Observer)
    // ------------------------------------------------------------------
    
    const sections = document.querySelectorAll('.section, .footer');
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Kích hoạt animation (class 'show' trong CSS)
                entry.target.classList.add('show'); 
                // Ngừng quan sát sau khi đã hiển thị
                observer.unobserve(entry.target); 
            }
        });
    }, {
        // Cấu hình: section hiện ra khi 10% nội dung đã vào viewport
        threshold: 0.1, 
        rootMargin: '0px 0px -50px 0px' 
    });

    sections.forEach(section => {
        // Thêm class 'fade-in' để thiết lập trạng thái ẩn ban đầu
        section.classList.add('fade-in'); 
        observer.observe(section);
    });

});

document.addEventListener("DOMContentLoaded", () => {
  const projectCards = document.querySelectorAll(".project-card");
  window.addEventListener("scroll", () => {
    projectCards.forEach(card => {
      const rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        card.style.opacity = "1";
        card.style.transform = "translateY(0)";
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".project-card");
  // hiện từng card với delay nhẹ nếu muốn hiệu ứng
  cards.forEach((c, i) => {
    setTimeout(() => c.classList.add("fade-in","show"), i * 120);
  });
});

// HIỆU ỨNG 3D TILT CHO PHẦN DỰ ÁN
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = (y - centerY) / 10;
    const rotateY = (centerX - x) / 10;
    card.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.05)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = 'rotateX(0) rotateY(0) scale(1)';
  });

  card.addEventListener('mouseenter', () => {
    card.style.transition = 'transform 0.2s ease';
  });
});


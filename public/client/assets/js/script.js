

// Khởi tạo giỏ hàng
const initialCart = localStorage.getItem('cart');
if (!initialCart) {
  localStorage.setItem('cart', JSON.stringify([]));
}
// end Khởi tạo giỏ hàng

// Khởi tạo AOS\
AOS.init();
// Hết khởi tạo AOS

// Button menu
const buttonMenu = document.querySelector('.header .inner-button-menu');

if (buttonMenu) {
  const menu = document.querySelector('.header .inner-menu');
  const menuOverlay = document.querySelector('.header .inner-menu-overlay');
  buttonMenu.addEventListener('click', () => {
    menu.classList.add('show');
    menuOverlay.classList.add('show');
  });
  menuOverlay.addEventListener('click', () => {
    menu.classList.remove('show');
    menuOverlay.classList.remove('show');
  });
  const listLi = document.querySelectorAll('.header .inner-menu>ul>li');
  listLi.forEach((li) => {
    const buttonDown = li.querySelector('i');
    if (buttonDown) {
      buttonDown.addEventListener('click', () => {
        if (li.classList.contains('show')) {
          li.classList.remove('show');
          buttonDown.classList.remove('fa-caret-up');
          buttonDown.classList.add('fa-caret-down');
        } else {
          li.classList.add('show');
          buttonDown.classList.remove('fa-caret-down');
          buttonDown.classList.add('fa-caret-up');
        }
      });
    }
  });
}
// End button menu


// Location
const boxLocationSection1 = document.querySelector('.section-1 .inner-location');
if (boxLocationSection1) {
  const boxInput = boxLocationSection1.querySelector('.inner-input-group ');
  const boxSuggest = boxLocationSection1.querySelector('.inner-suggest');
  const listItem = boxSuggest.querySelectorAll('.inner-item');
  const input = boxInput.querySelector('input');
  boxInput.addEventListener('click', () => {
    boxSuggest.classList.add('show');
  });
  listItem.forEach(item => {
    item.addEventListener('click', () => {
      const title = item.querySelector('.inner-name').innerHTML.trim();
      input.value = title;
      boxSuggest.classList.remove('show');
    });
  });
  document.addEventListener('click', (enent) => {
    if (!event.target.closest(".inner-location")) {
      boxSuggest.classList.remove('show');
    }
  });
}

// End Location

// Quantity
const boxQuantitySection1 = document.querySelector('.section-1 .inner-quantity');
if (boxQuantitySection1) {
  const boxInput = boxQuantitySection1.querySelector('.inner-input-group ');
  const boxListQuantity = boxQuantitySection1.querySelector('.inner-list-quantity');
  boxInput.addEventListener('click', () => {
    boxListQuantity.classList.add('show');
  })
  document.addEventListener('click', (enent) => {
    if (!event.target.closest(".inner-quantity")) {
      boxListQuantity.classList.remove('show');
    }
  })
  const listItem = boxListQuantity.querySelectorAll('.inner-item');
  listItem.forEach(item => {
    const buttonUp = item.querySelector('.inner-up');
    const buttonDown = item.querySelector('.inner-down');
    const input = item.querySelector('input');
    buttonDown.addEventListener('click', () => {
      if (input.value > 0) {
        const currentValue = parseInt(input.value);
        input.value = currentValue - 1;
      }
    })
    buttonUp.addEventListener('click', () => {
      const currentValue = parseInt(input.value);
      input.value = currentValue + 1;
    });
  });

}
// end Quantity

// Clock Expire
const clockExpire = document.querySelector('[clock-expire]');
if (clockExpire) {
  const timeClockExpire = clockExpire.getAttribute('clock-expire');
  const expireTime = new Date(timeClockExpire);
  const clockItemList = document.querySelectorAll('.section-2 .inner-clock-item .inner-number')
  const clockInterval = setInterval(() => {
    const currentTime = new Date();
    const remainingTime = expireTime - currentTime;
    if (remainingTime > 0) {
      const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
      const hours = Math.floor(remainingTime / (1000 * 60 * 60) % 24);
      const minutes = Math.floor(remainingTime / (1000 * 60) % 60)
      const seconds = Math.floor((remainingTime / 1000) % 60);
      clockItemList[0].innerHTML = days < 10 ? `0${days}` : days;
      clockItemList[1].innerHTML = hours < 10 ? `0${hours}` : hours;
      clockItemList[2].innerHTML = minutes < 10 ? `0${minutes}` : minutes;
      clockItemList[3].innerHTML = seconds < 10 ? `0${seconds}` : seconds;
    } else {
      clearInterval(clockInterval);
    }
  }, 1000)
}
// End Clock Expire

// Box Filter Section 9
const buttonFilter = document.querySelector('.section-9 .inner-button-filter');
if (buttonFilter) {
  const boxLeft = document.querySelector('.section-9 .inner-left');
  buttonFilter.addEventListener('click', () => {
    boxLeft.classList.toggle('show');
  })
}
// End Box Filter Section 9

// Boxn Tour Info
const boxnTourInfo = document.querySelector('.box-tour-info');
if (boxnTourInfo) {
  const boxTourContent = boxnTourInfo.querySelector('.box-tour-info .inner-content');
  const buttonShowAll = boxnTourInfo.querySelector('.box-tour-info .button-outline')
  buttonShowAll.addEventListener('click', () => {
    if (boxTourContent.classList.contains('show')) {
      boxTourContent.classList.remove('show');
      buttonShowAll.innerHTML = 'Thu gọn';
    }
    else {
      boxTourContent.classList.add('show');
      buttonShowAll.innerHTML = 'Xem tất cả';
    }
  })
  new Viewer(boxTourContent)
}
// End Boxn Tour Info


// Swiper Section2
const swiperSection2 = document.querySelector('.swiperSection2')
if (swiperSection2) {
  new Swiper('.swiperSection2', {
    slidesPerView: 1,
    spaceBetween: 20,
    breakpoints: {
      992: {
        slidesPerView: 2,
      },
      1200: {
        slidesPerView: 3,
      },
    },
    autoplay: {
      delay: 2500,
      disableOnInteraction: true,
    },
  });
}
// End Swiper Section2

// Swiper Section3
const swiperSection3 = document.querySelector('.swiperSection3')
if (swiperSection3) {
  new Swiper('.swiperSection3', {
    slidesPerView: 1,
    spaceBetween: 20,
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
    },
    breakpoints: {
      576: {
        slidesPerView: 2,
      },
      992: {
        slidesPerView: 3,
      },
    },
    autoplay: {
      delay: 2500,
      disableOnInteraction: true,
    },
  });
}
// End Swiper Section3

// Swiper Main Section 10
const swiperMainSection10 = document.querySelector('.swiperMainSection10');
if (swiperMainSection10) {
  const swiperThumbSection10 = new Swiper('.swiperThumbSection10', {
    spaceBetween: 4,
    slidesPerView: 4,
    freeMode: true,
    watchSlidesProgress: true,
    breakpoints: {
      576: {
        spaceBetween: 10,
      },
    },
  });
  const swiperMainSection10 = new Swiper('.swiperMainSection10', {
    spaceBetween: 10,
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    thumbs: {
      swiper: swiperThumbSection10,
    },
  });
}

// End Swiper Main Section 10

// Box Image
const boxImageMain = document.querySelector('.box-images .inner-image-main');
if (boxImageMain) {
  new Viewer(boxImageMain)
}
// End Box Image

// Box Tour Schedule 
const boxTourSchedule = document.querySelector('.box-tour-schedule')
if (boxTourSchedule) {
  new Viewer(boxTourSchedule)
}
// End Box Tour Schedule

// Email Form
const emailForm = document.querySelector('#emailForm');
if (emailForm) {
  const validator = new JustValidate('#emailForm');
  validator
    .addField("#email", [
      {
        rule: 'required',
        errorMessage: 'Email không được để trống',
      },
      {
        rule: 'email',
        errorMessage: 'Email không hợp lệ',
      },
    ])
    .onSuccess((event) => {
      const email = event.target.elements.email.value;
      const dataFinal = {
        email: email,
      }
      fetch('/contact/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataFinal),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.code === 'error') {
            notyf.error(data.message);
          }
          if (data.code === 'success') {
            notyf.success(data.message);
          }
        })
    })
}
// End Email Form

// Coupon Form
const couponForm = document.querySelector('#couponForm');
if (couponForm) {
  const validator = new JustValidate('#couponForm');
  validator
    .addField("#coupon", [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập mã giảm giá!',
      }
    ])
    .onSuccess((event) => {
      console.log(event.target.elements.coupon.value) //coupon là th thuộc tính name, element có thể bỏ bớt đc 
    })
}
// End Coupon Form

// Order Form
const orderForm = document.querySelector('#orderForm');
if (orderForm) {
  const validator = new JustValidate('#orderForm');
  validator
    .addField("#fullname", [
      {
        rule: 'required',
        errorMessage: 'Vui lòng điền tên!',
      },
      {
        rule: 'minLength',
        value: 5,
        errorMessage: 'Tên tối thiểu 5 kí tự!',
      },
      {
        rule: 'maxLength',
        value: 50,
        errorMessage: 'Họ và tên không được quá 50 ký tự!',
      },
    ])
    .addField("#phone", [
      {
        rule: 'required',
        errorMessage: 'Vui lòng điền số điện thoại!',
      },
      {
        rule: 'customRegexp',
        value: /^(0|\+?84)[35789]\d{8}$/,
        errorMessage: 'Số điện thoại chưa đúng định dạng Việt Nam!',
      },
    ])
    .onSuccess((event) => {
      console.log(event.target.fullname.value)
      console.log(event.target.phone.value)
      console.log(event.target.note.value)
      console.log(event.target.paymentMethod.value)
    })

  // Bank info section12
  const bankInfo = orderForm.querySelector('.inner-bank ');
  const paymentMethods = orderForm.querySelectorAll('input[name="paymentMethod"]');
  if (bankInfo && paymentMethods.length > 0) {
    paymentMethods.forEach((input) => {
      input.addEventListener('change', () => {
        if (input.id === 'paymentMethodBank' && input.checked) {
          bankInfo.classList.add('show');
        } else {
          bankInfo.classList.remove('show');
        }
      })
    })
  }
  // End Bank info section12

}
// End Order Form


// Box filter
const boxFilter = document.querySelector('.box-filter');
if (boxFilter) {
  const url = new URL(`${window.location.origin}/search`);
  const filterList = [
    "locationFrom",
    "locationTo",
    "departureDate",
    "stockAdult",
    "stockChildren",
    "stockBaby",
    "price"
  ]
  const buttonApply = boxFilter.querySelector('.inner-button');
  buttonApply.addEventListener('click', () => {
    for (const filter of filterList) {
      const input = boxFilter.querySelector(`[name="${filter}"]`);
      if (input) {
        const value = input.value;
        if (value && value !== "0") {
          url.searchParams.set(filter, value);
        } else {
          url.searchParams.delete(filter);
        }
      }
    }
    window.location.href = url.toString();
  })
  // Hiển thị filter đã chọn
  const urlCurrent = new URL(window.location.href);
  filterList.forEach((filter) => {
    const valueCurrent = urlCurrent.searchParams.get(filter);
    if (valueCurrent) {
      boxFilter.querySelector(`[name="${filter}"]`).value = valueCurrent;
    }
  })
  // end Hiển thị filter đã chọn
}
// end Box filter

// Form serch 
const formSearch = document.querySelector('[formSearch]');
if (formSearch) {
  const url = new URL(`${window.location.origin}/search`);
  const filterList = [
    "locationTo",
    "departureDate",
    "stockAdult",
    "stockChildren",
    "stockBaby",
  ]
  formSearch.addEventListener('submit', (e) => {
    e.preventDefault();
    for (const filter of filterList) {
      const input = formSearch.querySelector(`[name="${filter}"]`);
      if (input) {
        const value = input.value;
        if (value && value !== "0") {
          url.searchParams.set(filter, value);
        } else {
          url.searchParams.delete(filter);
        }
      }
    }
    window.location.href = url.toString();
  })
}
// end Form serch

// Hiển thị mini cart
const drawMiniCart = () => {
  const miniCart = document.querySelector("[miniCart]");
  if (miniCart) {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    miniCart.innerHTML = cart.length > 0 ? cart.length : "0";
  }
}
// end Hiển thị mini cart

drawMiniCart();
// box tour detail
const boxTourDetail = document.querySelector(".box-tour-detail")
if (boxTourDetail) {
  const listInputQuantity = boxTourDetail.querySelectorAll("[inputQuantity]")
  listInputQuantity.forEach(input => {
    input.addEventListener("input", () => {
      const name = input.name
      let value = parseInt(input.value) || 0
      const min = parseInt(input.min) || 0
      const max = parseInt(input.max)
      if (value < min) {
        value = min;
        input.value = min
        notyf.error(`Số lượng tối thiểu là ${min}`)
      }
      if (value > max) {
        value = max;
        input.value = max
        notyf.error(`Số lượng tối đa là ${max}`)
      }
      boxTourDetail.querySelector(`[stockLabel=${name}]`).innerHTML = value
      let total = 0
      listInputQuantity.forEach(item => {
        total += parseInt(item.value) * parseInt(item.getAttribute("price"))
      })
      boxTourDetail.querySelector("[total]").innerHTML = total.toLocaleString("vi-VN")
    })
  })
  // Thêm vào giỏ hàng
  const buttonAddToCart = boxTourDetail.querySelector("[button-add-cart]")
  buttonAddToCart.addEventListener("click", () => {
    const tourId = buttonAddToCart.getAttribute("tour-id")
    const locationForm = document.querySelector(`[name="locationForm"]`).value
    const quantityAdult = parseInt(document.querySelector(`[name="stockAdult"]`).value)
    const quantityChildren = parseInt(document.querySelector(`[name="stockChildren"]`).value)
    const quantityBaby = parseInt(document.querySelector(`[name="stockBaby"]`).value)
    if (quantityAdult + quantityChildren + quantityBaby == 0) {
      notyf.error("Vui lòng chọn số lượng ");
      return;
    }
    const cart = JSON.parse(localStorage.getItem('cart'));

    const existItem = cart.find(item => item.tourId === tourId);
    if (existItem) {
      existItem.locationForm = locationForm;
      existItem.quantityAdult = quantityAdult;
      existItem.quantityChildren = quantityChildren;
      existItem.quantityBaby = quantityBaby;
      notyf.success("Đã cập nhật giỏ hàng");
    } else {
      const cartItem = {
        tourId: tourId,
        locationForm: locationForm,
        quantityAdult: quantityAdult,
        quantityChildren: quantityChildren,
        quantityBaby: quantityBaby,
      };
      cart.unshift(cartItem)
      notyf.success("Đã thêm vào giỏ hàng");
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    drawMiniCart();
  })
  // Thêm vào giỏ hàng
}
//  end box tour detail


// Trang giỏ hàng
const eventInputQuantity = () => {
  const listInputQuantity = document.querySelectorAll("[inputQuantity]");
  listInputQuantity.forEach(input => {
    input.addEventListener("change", () => {
      const name = input.name
      let value = parseInt(input.value) || 0
      const min = parseInt(input.min) || 0
      const max = parseInt(input.max)

      if (value < min) {
        value = min;
        input.value = min
        notyf.error(`Số lượng tối thiểu là ${min}`)
      }
      if (value > max) {
        value = max;
        input.value = max
        notyf.error(`Số lượng tối đa là ${max}`)
      }
      const tourId = input.getAttribute("tourId")
      const cart = JSON.parse(localStorage.getItem('cart'));
      const existItem = cart.find(item => item.tourId === tourId);
      if (existItem) {
        existItem[name] = value;
        localStorage.setItem('cart', JSON.stringify(cart));
        drawCart();
      }
    })
  })
}
const drawCart = () => {
  const cartItems = localStorage.getItem('cart');
  fetch("/cart/detail", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: cartItems,
  })
    .then(res => res.json())
    .then(data => {
      if (data.code === 'error') {
        localStorage.setItem('cart', JSON.stringify([]));
        drawMiniCart();
        notyf.error(data.message);
      }
      if (data.code === 'success') {
        let subTotal = 0;
        const htmlArray = data.cartDetail.map(item => {
          const { detail } = item;
          subTotal += parseInt(detail.newPriceAdult) * parseInt(item.quantityAdult);
          subTotal += parseInt(detail.newPriceChildren) * parseInt(item.quantityChildren);
          subTotal += parseInt(detail.newPriceBaby) * parseInt(item.quantityBaby);
          return `
          <div class="inner-tour-item">
            <div class="inner-actions"><span class="inner-remove"><i class="fa-solid fa-xmark"></i></span>
              <input class="inner-check" type="checkbox"/>
            </div>
            <div class="inner-product"><a class="inner-image" href="/tour/detail/${detail.slug}"><img alt="${detail.tourName}" src="${detail.avatar}" onerror="this.src='https://placehold.co/140x100?text=No+Image'"/></a>
              <div class="inner-content">
                <h3 class="inner-title">
                  <a href="/tour/detail/${detail.slug}">${detail.tourName}</a>
                </h3>
                <div class="inner-desc">
                  <div>Ngày Khởi Hành: <b>${detail.departureDate}</b></div>
                  <div>Khởi Hành Tại: <b>${detail.cityName}</b></div>
                </div>
              </div>
            </div>
            <div class="inner-quantity">
              <div class="inner-label">Số Lượng Hành Khách</div>
              <div class="inner-list">
                <div class="inner-item">
                  <label for="">Người lớn:</label>
                  <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
                    <input
                      value="${item.quantityAdult}" 
                      name="quantityAdult"
                      tourId="${item.tourId}" 
                      type="number"
                      min = "0"
                      max = "${detail.stockAdult}"
                      inputQuantity
                    />
                    ${detail.stockAdult < item.quantityAdult ? `<span class="inner-error" style="position:absolute; top: 100%; white-space: nowrap;"> Còn lại ${detail.stockAdult}</span>` : ""}
                  </div>
                  <span>${item.quantityAdult} x<span class="text-main">${detail.newPriceAdult.toLocaleString("vi-VN")}</span></span>
                </div>
                <div class="inner-item">
                  <label for="">Trẻ em:</label>
                  <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
                    <input
                      value="${item.quantityChildren}" 
                      name="quantityChildren" 
                      tourId="${item.tourId}"
                      type="number"
                      min = "0"
                      max = "${detail.stockChildren}" 
                      inputQuantity
                    />
                    ${detail.stockChildren < item.quantityChildren ? `<span class="inner-error" style="position:absolute; top: 100%; white-space: nowrap;"> Còn lại ${detail.stockChildren}</span>` : ""}
                  </div>
                  <span>${item.quantityChildren} x<span class="text-main">${detail.newPriceChildren.toLocaleString("vi-VN")}</span></span>
                </div>
                <div class="inner-item">
                  <label for="">Em bé:</label>
                  <div style="position:relative; display:flex; flex-direction:column; align-items:center;">
                    <input
                      value="${item.quantityBaby}" 
                      name="quantityBaby"
                      tourId="${item.tourId}"
                      type="number"
                      min = "0"
                      max = "${detail.stockBaby}"
                      inputQuantity
                    />
                    ${detail.stockBaby < item.quantityBaby ? `<span class="inner-error" style="position:absolute; top: 100%; white-space: nowrap;"> Còn lại ${detail.stockBaby}</span>` : ""}
                  </div>
                  <span>${item.quantityBaby} x<span class="text-main">${detail.newPriceBaby.toLocaleString("vi-VN")}</span></span>
                </div>
              </div>
            </div>
          </div>
          `
        })
        const discount = 0
        const total = subTotal - discount;
        const elementCartList = document.querySelector("[cart-list]");
        elementCartList.innerHTML = htmlArray.join('');
        const elementSubTotal = pageCart.querySelector("[sub-total]");
        elementSubTotal.innerHTML = subTotal.toLocaleString("vi-VN");
        const elementDiscount = pageCart.querySelector("[discount]");
        elementDiscount.innerHTML = discount.toLocaleString("vi-VN");
        const elementTotal = pageCart.querySelector("[total]");
        elementTotal.innerHTML = total.toLocaleString("vi-VN");
        eventInputQuantity();
      }
    })
}

const pageCart = document.querySelector("[page-cart]")
if (pageCart) {
  drawCart();
}
// end Trang giỏ hàng
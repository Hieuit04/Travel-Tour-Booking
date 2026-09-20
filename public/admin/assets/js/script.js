// Init Tiny MCE 
const initTinyMCE = (selector) => {
  if (typeof tinymce === 'undefined') return;
  const targetSelector = selector || '[textarea-mce]';
  if (document.querySelector(targetSelector)) {
    tinymce.init({
      selector: selector || '[textarea-mce]',
      plugins: ['charmap', 'codesample', 'emoticons', 'image', 'insertdatetime', 'link', 'media', 'fullscreen', 'preview', 'quickbars', 'searchreplace', 'wordcount', 'anchor', 'link', 'lists', 'advlist', 'table'],
      toolbar: 'undo redo | styles | table| bold italic underline strikethrough | alignleft aligncenter alignright alignjustify | bullist numlist | outdent indent | link image | searchreplace | fullscreen preview  ',
      quickbars_selection_toolbar: 'bold italic underline | blocks | bullist numlist | blockquote quicklink',
    })
  }
}
initTinyMCE()

// End Init Tiny MCE 


// Sider
const sider = document.querySelector('.sider')
if (sider) {
  // Đóng mở
  const buttonMenu = document.querySelector('.header .inner-button-menu')
  buttonMenu.addEventListener('click', () => {
    sider.classList.toggle('show')
  })
  // Active menu
  const listTagA = sider.querySelectorAll('a')
  const pathname = window.location.pathname;
  const pathNameSplit = pathname.split('/')
  listTagA.forEach((tagA) => {
    const href = tagA.getAttribute('href');
    const hrefSplit = href.split('/')
    if (hrefSplit[2] === pathNameSplit[2]) {
      tagA.classList.add('active')
    }
  })
}
// End Sider

// Schedule Section8
const scheduleSection8 = document.querySelector('.section-8 .inner-schedule')
if (scheduleSection8) {
  const buttonCreate = scheduleSection8.querySelector('.inner-schedule-create');
  const boxList = scheduleSection8.querySelector('.inner-schedule-list');
  buttonCreate.addEventListener('click', () => {
    const firstItem = boxList.querySelector('.inner-schedule-item');
    const cloneItem = firstItem.cloneNode(true);
    cloneItem.querySelector('input').value = '';
    // Xử lý lỗi tinyMCE sau khi clone
    /** @type {HTMLElement} */
    const boxBody = cloneItem.querySelector('.inner-schedule-body');
    const id = `mce_${Date.now()}`;
    boxBody.innerHTML = `<textarea textarea-mce id="${id}"></textarea>`
    boxList.appendChild(cloneItem);
    initTinyMCE(`#${id}`) // Khởi tạo lại với ID mới 
  })
  boxList.addEventListener('click', (event) => {
    //Đóng mở item 
    if (event.target.closest('.inner-more')) {
      const item = event.target.closest('.inner-schedule-item');
      if (item.classList.contains('hidden')) {
        item.classList.remove('hidden');
        item.querySelector('.inner-more i').setAttribute("class", "fa-solid fa-angle-up");
      } else {
        item.classList.add('hidden');
        item.querySelector('.inner-more i').setAttribute("class", "fa-solid fa-angle-down");
      }
    }
    //End đóng mở item

    // Xoá item
    if (event.target.closest('.inner-remove')) {
      const item = event.target.closest('.inner-schedule-item');
      const totalItem = boxList.querySelectorAll('.inner-schedule-item').length;
      if (totalItem > 1) {
        item.remove();
      }
    }
    // End xoá item
  })
  // Sort Item Section 8
  new Sortable(boxList, {
    handle: '.inner-move', // handle's class
    animation: 150,
    onStart: function (event) {
      const textarea = event.item.querySelector('[textarea-mce]');
      const id = textarea.id;
      if (textarea && id && tinymce.get(id)) {
        tinymce.get(id).remove();
      }
    },
    onEnd: function (event) {
      const textarea = event.item.querySelector('[textarea-mce]');
      const id = textarea.id;
      if (textarea && id && tinymce.get(id)) {
        initTinyMCE(id); // Khởi tạo lại với ID
      }
    }
  });
  // End Sort Item Section 8
}
// End Schedule Section8

// File Pond 
const listFilepondImage = document.querySelectorAll('[filepondImage]');
let filePond = {};
if (listFilepondImage.length > 0) {
  FilePond.registerPlugin(FilePondPluginImagePreview);
  // FilePond.registerPlugin(FilePondPluginImageCrop);`
  FilePond.registerPlugin(FilePondPluginFileValidateType);

  listFilepondImage.forEach((filepondImage) => {
    const file = []
    const imageDefault = filepondImage.getAttribute('image-default')
    if (imageDefault) {
      file.push(imageDefault);
    }
    filePond[filepondImage.name] = FilePond.create(filepondImage, {
      labelIdle: '+',
      files: file,
      // allowImageCrop: true,
      // imageCropAspectRatio: '1:1',
    });
  })
}
// End File Pond

// Revenue chart 
const revenueChart = document.querySelector('#revenue-chart');
if (revenueChart) {
  new Chart(revenueChart, {
    type: 'line',
    data: {
      labels: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31],
      datasets: [
        {
          label: 'Tháng này',
          data: [20000, 25000, 30000, 35000, 40000, 45000, 50000, 55000, 60000, 65000, 70000, 75000, 80000, 85000, 90000, 489000, 95000, 100000, 105000, 110000, 115000, 120000, 125000, 130000, 135000, 140000, 145000, 150000, 0, 0, 0],
          borderColor: '#007bff',
          borderWidth: 1.5,
        },
        {
          label: 'Tháng trước',
          data: [10000, 35000, 80000, 95000, 60000, 60000, 60000, 60000, 60000, 60000, 60000, 60000, 80000, 85000, 85000, 85000, 85000, 85000, 85000, 85000, 85000, 120000, 85000, 85000, 85000, 140000, 145000, 140000, 140000, 140000, 140000],
          borderColor: '#ff002b',
          borderWidth: 1.5,
        }
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom'
        }
      },
      scales: {
        x: {
          title: {
            display: true,
            text: 'Ngày',
          }
        },
        y: {
          title: {
            display: true,
            text: 'Doanh thu',
          }
        }
      }
    },
  });
}
// End Revenue chart

// Validate category create form
const categoryCreateForm = document.querySelector('.section-8 #category-create-form');
if (categoryCreateForm) {
  const validator = new JustValidate('#category-create-form');
  validator
    .addField('#categoryName', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên danh mục!',
      },
    ])

    .onSuccess((event) => {
      const btnSubmit = event.target.querySelector('button[type="submit"]');
      // 1. Khóa nút và đổi text thành đang xử lý
      btnSubmit.disabled = true;
      btnSubmit.innerText = "Đang xử lý..."

      const categoryName = event.target.categoryName.value;
      const parent = event.target.parent.value;
      const position = event.target.position.value;
      const status = event.target.status.value;
      const avatar = filePond.avatar?.getFile()?.file || null;

      const description = tinymce.get('description').getContent();

      const formData = new FormData();
      formData.append('categoryName', categoryName);
      formData.append('parent', parent);
      formData.append('position', position);
      formData.append('status', status);
      if (avatar) {
        formData.append('avatar', avatar, avatar.name);
      }
      formData.append('description', description);
      console.log('Avatar sent:', avatar);
      fetch(`/${pathAdmin}/category/create`, { // Thay đổi URL thành URL mới
        method: 'POST',
        body: formData,
      })
        .then(res => res.json())
        .then(data => {
          // 2. Mở lại nút nếu có lỗi
          btnSubmit.disabled = false;
          btnSubmit.innerText = "Tạo mới";
          if (data.code === 'error') {
            notyf.error(data.message); // In ra thông báo lỗi khi ko bị load lại trang
            // drawNotyf("error", data.message); // In ra thông báo lỗi khi bị load lại trang
          }
          if (data.code === 'success') {
            console.log(data)
            //notyf.success(data.message); // In ra thông báo thành công khi ko bị load lại trang
            drawNotyf(data.code, data.message);// In ra thông báo thành công khi bị load lại trang
            window.location.reload();
          }
        })
    });
}
// End validate category create form

// Validate edit form
const categoryEditForm = document.querySelector('.section-8 #category-edit-form');
if (categoryEditForm) {
  const validator = new JustValidate('#category-edit-form');
  validator
    .addField('#categoryName', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên danh mục!',
      },
    ])

    .onSuccess((event) => {
      const id = event.target.id.value;
      const categoryName = event.target.categoryName.value;
      const parent = event.target.parent.value;
      const position = event.target.position.value;
      const status = event.target.status.value;
      const avatar = filePond.avatar?.getFile()?.file || null;

      const description = tinymce.get('description').getContent();

      const formData = new FormData();
      formData.append('categoryName', categoryName);
      formData.append('parent', parent);
      formData.append('position', position);
      formData.append('status', status);
      if (avatar) {
        formData.append('avatar', avatar, avatar.name);
      }
      formData.append('description', description);
      console.log('Avatar sent:', avatar);
      fetch(`/${pathAdmin}/category/edit/${id}`, { // Thay đổi URL thành URL mới
        method: 'PATCH',
        body: formData,
      })
        .then(res => res.json())
        .then(data => {
          if (data.code === 'error') {
            notyf.error(data.message); // In ra thông báo lỗi khi ko bị load lại trang
            // drawNotyf("error", data.message); // In ra thông báo lỗi khi bị load lại trang
          }
          if (data.code === 'success') {
            console.log(data)
            notyf.success(data.message); // In ra thông báo thành công khi ko bị load lại trang

          }
        })
    });
}
// End validate edit form



// Validate tour create form
const tourCreateForm = document.querySelector('.section-8 #tour-create-form');
if (tourCreateForm) {
  const validator = new JustValidate('#tour-create-form');
  validator
    .addField('#tourName', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên tour!',
      },
    ])

    .onSuccess((event) => {
      const tourName = event.target.tourName.value;
      const category = event.target.category.value;
      const position = event.target.position.value;
      const status = event.target.status.value;
      const avatar = filePond.avatar.getFile()?.file || null;
      const priceAdult = event.target.priceAdult.value;
      const priceChildren = event.target.priceChildren.value;
      const priceBaby = event.target.priceBaby.value;
      const newPriceAdult = event.target.newPriceAdult.value;
      const newPriceChildren = event.target.newPriceChildren.value;
      const newPriceBaby = event.target.newPriceBaby.value;
      const stockAdult = event.target.stockAdult.value;
      const stockChildren = event.target.stockChildren.value;
      const stockBaby = event.target.stockBaby.value;
      const loaction = [];
      const time = event.target.time.value;
      const vihicle = event.target.vehicle.value;
      const departureDate = event.target.departureDate.value;
      const information = tinymce.get('information').getContent();
      const schedule = [];
      // location
      const listLocationChecked = document.querySelectorAll('input[name="locations"]:checked');
      listLocationChecked.forEach((location) => {
        loaction.push(location.value);
      });
      // end location
      // schedule
      const listSchedule = document.querySelectorAll('.section-8 .inner-schedule-list .inner-schedule-item');
      listSchedule.forEach((item) => {
        const inputTitle = item.querySelector('.inner-schedule-head input');
        const title = inputTitle ? inputTitle.value : '';
        const textarea = item.querySelector('[textarea-mce]');
        const id = textarea ? textarea.id : '';
        const content = id && tinymce.get(id) ? tinymce.get(id).getContent() : '';
        schedule.push({
          title: title,
          content: content,
        });
      })
      // schedule
      const formData = new FormData();
      formData.append('tourName', tourName);
      formData.append('category', category);
      formData.append('position', position);
      formData.append('status', status);
      if (avatar) {
        formData.append('avatar', avatar);
      }
      formData.append('priceAdult', priceAdult);
      formData.append('priceChildren', priceChildren);
      formData.append('priceBaby', priceBaby);
      formData.append('newPriceAdult', newPriceAdult);
      formData.append('newPriceChildren', newPriceChildren);
      formData.append('newPriceBaby', newPriceBaby);
      formData.append('stockAdult', stockAdult);
      formData.append('stockChildren', stockChildren);
      formData.append('stockBaby', stockBaby);
      formData.append('loaction', JSON.stringify(loaction));
      formData.append('time', time);
      formData.append('vihicle', vihicle);
      formData.append('departureDate', departureDate);
      formData.append('information', information);
      formData.append('schedule', JSON.stringify(schedule));
      fetch(`/${pathAdmin}/tour/create`, { // Thay đổi URL thành URL mới
        method: 'POST',
        body: formData,
      })
        .then(res => res.json())
        .then(data => {
          if (data.code === 'error') {
            notyf.error(data.message); // In ra thông báo lỗi khi ko bị load lại trang
            // drawNotyf("error", data.message); // In ra thông báo lỗi khi bị load lại trang
          }
          if (data.code === 'success') {
            drawNotyf(data.code, data.message);// In ra thông báo thành công khi bị load lại trang
            window.location.reload();
          }
        });
    })
}
// End validate tour create form


// Validate tour edit form
const tourEditForm = document.querySelector('.section-8 #tour-edit-form');
if (tourEditForm) {
  const validator = new JustValidate('#tour-edit-form');
  validator
    .addField('#tourName', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên tour!',
      },
    ])

    .onSuccess((event) => {
      const id = event.target.id.value;
      const tourName = event.target.tourName.value;
      const category = event.target.category.value;
      const position = event.target.position.value;
      const status = event.target.status.value;
      const avatar = filePond.avatar.getFile()?.file || null;
      const priceAdult = event.target.priceAdult.value;
      const priceChildren = event.target.priceChildren.value;
      const priceBaby = event.target.priceBaby.value;
      const newPriceAdult = event.target.newPriceAdult.value;
      const newPriceChildren = event.target.newPriceChildren.value;
      const newPriceBaby = event.target.newPriceBaby.value;
      const stockAdult = event.target.stockAdult.value;
      const stockChildren = event.target.stockChildren.value;
      const stockBaby = event.target.stockBaby.value;
      const loaction = [];
      const time = event.target.time.value;
      const vihicle = event.target.vehicle.value;
      const departureDate = event.target.departureDate.value;
      const information = tinymce.get('information').getContent();
      const schedule = [];
      // location
      const listLocationChecked = document.querySelectorAll('input[name="locations"]:checked');
      listLocationChecked.forEach((location) => {
        loaction.push(location.value);
      });
      // end location
      // schedule
      const listSchedule = document.querySelectorAll('.section-8 .inner-schedule-list .inner-schedule-item');
      listSchedule.forEach((item) => {
        const inputTitle = item.querySelector('.inner-schedule-head input');
        const title = inputTitle ? inputTitle.value : '';
        const textarea = item.querySelector('[textarea-mce]');
        const id = textarea ? textarea.id : '';
        const content = id && tinymce.get(id) ? tinymce.get(id).getContent() : '';
        schedule.push({
          title: title,
          content: content,
        });
      })
      // schedule
      const formData = new FormData();
      formData.append('tourName', tourName);
      formData.append('category', category);
      formData.append('position', position);
      formData.append('status', status);
      if (avatar) {
        formData.append('avatar', avatar);
      }
      formData.append('priceAdult', priceAdult);
      formData.append('priceChildren', priceChildren);
      formData.append('priceBaby', priceBaby);
      formData.append('newPriceAdult', newPriceAdult);
      formData.append('newPriceChildren', newPriceChildren);
      formData.append('newPriceBaby', newPriceBaby);
      formData.append('stockAdult', stockAdult);
      formData.append('stockChildren', stockChildren);
      formData.append('stockBaby', stockBaby);
      formData.append('loaction', JSON.stringify(loaction));
      formData.append('time', time);
      formData.append('vihicle', vihicle);
      formData.append('departureDate', departureDate);
      formData.append('information', information);
      formData.append('schedule', JSON.stringify(schedule));
      fetch(`/${pathAdmin}/tour/edit/${id}`, { // Thay đổi URL thành URL mới
        method: 'PATCH',
        body: formData,
      })
        .then(res => res.json())
        .then(data => {
          if (data.code === 'error') {
            notyf.error(data.message); // In ra thông báo lỗi khi ko bị load lại trang
            // drawNotyf("error", data.message); // In ra thông báo lỗi khi bị load lại trang
          }
          if (data.code === 'success') {
            notyf.success(data.message);
          }
        });
    })
}
// End validate tour edit form



// Validate order edit form
const orderEditForm = document.querySelector('.section-8 #order-edit-form');
if (orderEditForm) {
  const validator = new JustValidate('#order-edit-form');
  validator
    .addField('#customerName', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên khách hàng!',
      },
    ])
    .addField('#phone', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập số điện thoại!',
      },
      {
        rule: 'customRegexp',
        value: /^(0|\+?84)[35789]\d{8}$/,
        errorMessage: 'Số điện thoại chưa đúng định dạng Việt Nam!',
      },
    ])

    .onSuccess((event) => {
      const customerName = event.target.customerName.value;
      const phone = event.target.phone.value;
      const notes = event.target.notes.value;
      const paymentMethod = event.target.paymentMethod.value;
      const paymentStatus = event.target.paymentStatus.value;
      const orderDate = event.target.orderDate.value;
      const status = event.target.status.value;
      console.log(customerName);
      console.log(phone);
      console.log(notes);
      console.log(paymentMethod);
      console.log(paymentStatus);
      console.log(orderDate);
      console.log(status);
    });
}
// End validate order edit form


// Validate setting website info form
const settingWebsiteInfoForm = document.querySelector('.section-8 #setting-website-info-form');
if (settingWebsiteInfoForm) {
  const validator = new JustValidate('#setting-website-info-form');
  validator
    .addField('#nameWebsite', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên website!',
      },
    ])
    .addField('#phone', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập số điện thoại!',
      },
      {
        rule: 'customRegexp',
        value: /^(0|\+?84)[35789]\d{8}$/,
        errorMessage: 'Số điện thoại chưa đúng định dạng Việt Nam!',
      },
    ])
    .addField('#email', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập email!',
      },
      {
        rule: 'email',
        errorMessage: 'Email chưa đúng định dạng!',
      }
    ])
    .onSuccess((event) => {
      const nameWebsite = event.target.nameWebsite.value;
      const phone = event.target.phone.value;
      const email = event.target.email.value;
      const address = event.target.address.value;
      const logo = filePond.logo.getFile()?.file || null;
      const favicon = filePond.favicon.getFile()?.file || null;
      console.log(nameWebsite);
      console.log(phone);
      console.log(email);
      console.log(address);
      console.log(logo);
      console.log(favicon);
    });
}
// End validate setting website info form


// Validate setting account admin create form
const settingAccountAdminCreateForm = document.querySelector('.section-8 #setting-account-admin-create-form');
if (settingAccountAdminCreateForm) {
  const validator = new JustValidate('#setting-account-admin-create-form');
  validator
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên!',
      },
    ])
    .addField('#phone', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập số điện thoại!',
      },
      {
        rule: 'customRegexp',
        value: /^(0|\+?84)[35789]\d{8}$/,
        errorMessage: 'Số điện thoại chưa đúng định dạng Việt Nam!',
      },
    ])
    .addField('#email', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập email!',
      },
      {
        rule: 'email',
        errorMessage: 'Email chưa đúng định dạng!',
      }
    ])
    .addField('#password', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập mật khẩu!',
      },
      {
        rule: 'strongPassword',
        errorMessage: (value) => {
          let html = ``;
          if (value.length < 8) {
            html += `<div>Mật khẩu tối thiểu 8 ký tự!</div>`
          }
          if (!/[0-9]/.test(value)) {
            html += `<div>Mật khẩu phải chứa ít nhất 1 chữ số!</div>`
          }
          if (!/[a-z]/.test(value)) {
            html += `<div>Mật khẩu phải chứa ít nhất 1 chữ viết thường!</div>`
          }
          if (!/[A-Z]/.test(value)) {
            html += `<div>Mật khẩu phải chứa ít nhất 1 chữ viết hoa!</div>`
          }
          if (!/[^A-Za-z0-9]/.test(value)) {
            html += `<div>Mật khẩu phải chứa ký tự đặc biệt!</div>`
          }
          return html
        }
      }
    ])
    .onSuccess((event) => {
      const name = event.target.name.value;
      const email = event.target.email.value;
      const phone = event.target.phone.value;
      const role = event.target.role.value;
      const position = event.target.position.value;
      const status = event.target.status.value;
      const password = event.target.password.value;
      const avatar = filePond.avatar.getFile()?.file || null;
      console.log(name);
      console.log(email);
      console.log(phone);
      console.log(role);
      console.log(position);
      console.log(status);
      console.log(password);
      console.log(avatar);
    });
}
// End validate setting account admin create form



// Validate setting role create form
const roleCreateForm = document.querySelector('.section-8 #setting-role-create-form');
if (roleCreateForm) {
  const validator = new JustValidate('#setting-role-create-form');
  validator
    .addField('#roleName', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên nhóm quyền!',
      },
    ])

    .onSuccess((event) => {
      const roleName = event.target.roleName.value;
      const description = event.target.description.value;
      const rolePermissions = [];
      const listRolePermissionsChecked = document.querySelectorAll('input[name="rolePermissions"]:checked');
      listRolePermissionsChecked.forEach((permission) => {
        rolePermissions.push(permission.value);
      });
      const dataFinal = {
        roleName,
        description,
        rolePermissions,
      }
      fetch(`/${pathAdmin}/setting/role/create`, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataFinal),
      })
        .then(res => res.json())
        .then(data => {
          if (data.code === 'error') {
            notyf.error(data.message);
          }
          if (data.code === 'success') {
            drawNotyf(data.code, data.message); // In ra thông báo thành công khi bị load lại trang
            window.location.reload();
          }
        })
    });
}
// End validate setting role create form

// Validate setting role edit form
const roleEditForm = document.querySelector('.section-8 #setting-role-edit-form');
if (roleEditForm) {
  const validator = new JustValidate('#setting-role-edit-form');
  validator
    .addField('#roleName', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập tên nhóm quyền!',
      },
    ])

    .onSuccess((event) => {
      const id= event.target.id.value
      const roleName = event.target.roleName.value;
      const description = event.target.description.value;
      const rolePermissions = [];
      const listRolePermissionsChecked = document.querySelectorAll('input[name="rolePermissions"]:checked');
      listRolePermissionsChecked.forEach((permission) => {
        rolePermissions.push(permission.value);
      });
      const dataFinal = {
        roleName,
        description,
        rolePermissions,
      }
      fetch(`/${pathAdmin}/setting/role/edit/${id}`, {
        method: 'PATCH',
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataFinal),
      })
        .then(res => res.json())
        .then(data => {
          if (data.code === 'error') {
            notyf.error(data.message);
          }
          if (data.code === 'success') {
            notyf.success(data.message);
          }
        })
    });
}
// End validate setting role edit form


// Validate profile edit form
const profileEditForm = document.querySelector('.section-8 #profile-edit-form');
if (profileEditForm) {
  const validator = new JustValidate('#profile-edit-form');
  validator
    .addField('#name', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập họ tên!',
      },
    ])
    .addField('#email', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập email!',
      },
      {
        rule: 'email',
        errorMessage: 'Email không hợp lệ!',
      }
    ])
    .addField('#phone', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập số điện thoại!',
      },
      {
        rule: 'customRegexp',
        value: /^(0|\+?84)[35789]\d{8}$/,
        errorMessage: 'Số điện thoại chưa đúng định dạng Việt Nam!',
      },
    ])
    .onSuccess((event) => {
      const name = event.target.name.value;
      const email = event.target.email.value;
      const phone = event.target.phone.value;
      const position = event.target.position.value;
      const role = event.target.role.value;
      const avatar = filePond.avatar.getFile()?.file || null;
      console.log(name);
      console.log(email);
      console.log(phone);
      console.log(position);
      console.log(role);
      console.log(avatar);
    });
}
// End validate profile edit form



// Validate profile change password form
const changePasswordForm = document.querySelector('#profile-change-password-form');
if (changePasswordForm) {
  const validator = new JustValidate('#profile-change-password-form');
  validator
    .addField('#password', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập mật khẩu!',
      },
      {
        rule: 'strongPassword',
        errorMessage: (value) => {
          let html = ``;
          if (value.length < 8) {
            html += `<div>Mật khẩu tối thiểu 8 ký tự!</div>`
          }
          if (!/[0-9]/.test(value)) {
            html += `<div>Mật khẩu phải chứa ít nhất 1 chữ số!</div>`
          }
          if (!/[a-z]/.test(value)) {
            html += `<div>Mật khẩu phải chứa ít nhất 1 chữ viết thường!</div>`
          }
          if (!/[A-Z]/.test(value)) {
            html += `<div>Mật khẩu phải chứa ít nhất 1 chữ viết hoa!</div>`
          }
          if (!/[^A-Za-z0-9]/.test(value)) {
            html += `<div>Mật khẩu phải chứa ký tự đặc biệt!</div>`
          }
          return html
        }
      }
    ])
    .addField('#confirmPassword', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập mật khẩu!',
      },
      {
        validator: (value, fields) => {
          if (fields['#password'] && fields['#password'].elem) {
            const passwordValue = fields['#password'].elem.value;
            return value === passwordValue;
          }
          return true;
        },
        errorMessage: 'Mật khẩu xác nhận không trùng khớp!',
      }
    ])
    .onSuccess((event) => {
      console.log(event.target.password.value);
      console.log(event.target.confirmPassword.value);
    });
}
// End validate profile change password form



// Button delete
const listBtnDelete = document.querySelectorAll('[button-delete]');
if (listBtnDelete.length > 0) {
  listBtnDelete.forEach((button) => {
    button.addEventListener('click', async (e) => {
      const isConfirm = confirm('Vui lòng xác nhận xóa!');
      if (!isConfirm) {
        return;
      }
      const dataApi = button.getAttribute('data-api');
      fetch(dataApi, {
        method: 'PATCH',

      })
        .then(res => res.json())
        .then(data => {
          if (data.code === 'error') {
            notyf.error(data.message);
          }
          if (data.code === 'success') {
            drawNotyf(data.code, data.message); // In ra thông báo thành công khi bị load lại trang
            window.location.reload();
          }
        })
    })
  })
}
// End button delete

// Filter
const listFilter = document.querySelectorAll('[filter]');
if (listFilter.length > 0) {
  const url = new URL(window.location.href)
  const listName = []
  listFilter.forEach((filter) => {
    listName.push(filter.name);
    filter.addEventListener('change', () => {
      const name = filter.name;
      const value = filter.value;
      if (value) {
        url.searchParams.set(name, value);
      }
      else {
        url.searchParams.delete(filter.name);
      }
      window.location.href = url.href;
    })
    // Hiển thị lựa chọn mặc định
    const valueCurent = url.searchParams.get(filter.name);
    if (valueCurent) {
      filter.value = valueCurent;
    }
  })
  // Button reset filter 
  const btnResetFilter = document.querySelector('[button-reset-filter]');
  if (btnResetFilter) {
    btnResetFilter.addEventListener('click', () => {
      const url = new URL(window.location.href);
      listName.forEach((name) => {
        url.searchParams.delete(name);
      })
      window.location.href = url.href;
    })
  }
  // End Button reset filter 
}

// End Filter

// Check All
const checkAll = document.querySelector('[name="check-all"]');
if (checkAll) {
  checkAll.addEventListener('click', () => {
    const listCheck = document.querySelectorAll('[name="check-item"]');
    listCheck.forEach((check) => {
      check.checked = checkAll.checked;
    })
  })
}
// End Check All

// Change Multi 
const changeMulti = document.querySelector('[change-multi]');
if (changeMulti) {
  const select = changeMulti.querySelector("select")
  const button = changeMulti.querySelector("button")
  const dataApi = changeMulti.getAttribute("data-api")
  button.addEventListener("click", async () => {
    const option = select.value;
    const listInputChecked = document.querySelectorAll('[name="check-item"]:checked');
    const listId = [];
    listInputChecked.forEach((input) => {
      listId.push(input.value);
    })
    if (!option) {
      notyf.error("Vui lòng chọn một hành động!");
      return;
    }
    if (listId.length < 1) {
      notyf.error("Vui lòng chọn ít nhất một danh mục!");
      return;
    }
    dataFinal = {
      option: option,
      listId: listId,
    }
    fetch(dataApi, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dataFinal),
    })
      .then(res => res.json())
      .then(data => {
        if (data.code === "error") {
          notyf.error(data.message);
        }
        if (data.code === "success") {
          drawNotyf(data.code, data.message); // In ra thông báo thành công khi bị load lại trang
          window.location.reload();
        }
      })
  })
}
// End Change Multi

// search
const inputSearch = document.querySelector('[input-search]');
if (inputSearch) {
  const url = new URL(window.location.href);
  inputSearch.addEventListener('keyup', (event) => {
    if (event.code !== "Enter") return;
    const value = event.target.value;
    if (value) {
      url.searchParams.set('keyword', value);
    }
    else {
      url.searchParams.delete('keyword');
    }
    window.location.href = url.href;
  })
  const keyword = url.searchParams.get('keyword');
  const valueCurent = keyword ? keyword.trim().replace(/\s+/g, " ") : "";
  if (valueCurent) {
    inputSearch.value = valueCurent;
  }
}
// end search

// pagination
const selectPagination = document.querySelector('[pagination]');
if (selectPagination) {
  const url = new URL(window.location.href);
  selectPagination.addEventListener('change', () => {
    const value = selectPagination.value;
    if (value) {
      url.searchParams.set('page', value);
    }
    else {
      url.searchParams.delete('page');
    }
    window.location.href = url.href;
  })
  const valueCurent = url.searchParams.get('page');
  if (valueCurent) {
    selectPagination.value = valueCurent;
  }
}
// end pagination
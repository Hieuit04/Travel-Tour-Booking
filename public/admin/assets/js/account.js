
// Validate login form
const loginForm = document.querySelector('.form-account #login-form');
if (loginForm) {
  const validator = new JustValidate('#login-form');
  validator
    .addField('#email', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập email',
      },
      {
        rule: 'email',
        errorMessage: 'Email không hợp lệ'
      }
    ])
    .addField('#password', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập mật khẩu',
      },
    ])
    .onSuccess((event) => {
      const email = event.target.email.value
      const password = event.target.password.value
      const rememberPassword = event.target.rememberPassword.checked;
      const dataFinal = {
        email: email,
        passWord: password,
        rememberPassword: rememberPassword,
      }
      fetch(`/admin/account/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dataFinal),
      })
        .then(res => res.json())
        .then(data => {
          if (data.code === 'error') {
            notyf.error(data.message); // In ra thông báo lỗi khi ko bị load lại trang
            // drawNotyf("error", data.message); // In ra thông báo lỗi khi bị load lại trang
          }
          if (data.code === 'success') {
            console.log(data)
            //notyf.success(data.message); // In ra thông báo thành công khi ko bị load lại trang
            drawNotyf(data.code, data.message);// In ra thông báo thành công khi bị load lại trang
            window.location.href = `/${pathAdmin}/dashboard`;
          }
        })
    });
}

// End validate login form


// Validate register form
const registerForm = document.querySelector('.form-account #register-form');
if (registerForm) {
  const validator = new JustValidate('#register-form');
  validator
    .addField("#fullName", [
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
    .addField('#email', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập email',
      },
      {
        rule: 'email',
        errorMessage: 'Email không hợp lệ!'
      }
    ])
    .addField('#password', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập mật khẩu',
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
    .addField('#agree', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng đồng ý với điều khoản!',
      },
    ])
    .onSuccess((event) => {

      const fullName = event.target.fullName.value
      const email = event.target.email.value
      const password = event.target.password.value
      const dataFinal = {
        fullName: fullName,
        email: email,
        passWord: password,
      }
      fetch(`/admin/account/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dataFinal),
      })
        .then(res => res.json())
        .then(data => {
          if (data.code === 'error') {
            notyf.error(data.message); // In ra thông báo lỗi khi ko bị load lại trang
            // drawNotyf("error", data.message); // In ra thông báo lỗi khi bị load lại trang
          }
          if (data.code === 'success') {
            console.log(data)
            //notyf.success(data.message); // In ra thông báo thành công khi ko bị load lại trang
            drawNotyf(data.code, data.message);// In ra thông báo thành công khi bị load lại trang
            window.location.href = `/${pathAdmin}/account/register-success`;
          }
        })
    })
}

// End validate register form

// Validate forgot password form
const forgotPasswordForm = document.querySelector('.form-account #forgot-password-form');
if (forgotPasswordForm) {
  const validator = new JustValidate('#forgot-password-form');
  validator
    .addField('#email', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập email',
      },
      {
        rule: 'email',
        errorMessage: 'Email không hợp lệ!'
      }
    ])
    .onSuccess((event) => {
      const email = event.target.email.value
      const dataFinal = {
        email: email,
      }
      fetch(`/admin/account/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dataFinal),
      })
        .then(res => res.json())
        .then(data => {
          if (data.code === 'error') {
            notyf.error(data.message); // In ra thông báo lỗi khi ko bị load lại trang
            // drawNotyf("error", data.message); // In ra thông báo lỗi khi bị load lại trang
          }
          if (data.code === 'success') {
            console.log(data)
            //notyf.success(data.message); // In ra thông báo thành công khi ko bị load lại trang
            drawNotyf(data.code, data.message);// In ra thông báo thành công khi bị load lại trang
            window.location.href = `/${pathAdmin}/account/otp-password?email=${email}`;
          }
        })
    });
}

// End validate forgot password form

// Validate OTP password form
const otpPasswordForm = document.querySelector('.form-account #otp-password-form');
if (otpPasswordForm) {
  const validator = new JustValidate('#otp-password-form');
  validator
    .addField('#otp', [
      {
        rule: 'required',
        errorMessage: 'Vui lòng nhập OTP!',
      },
    ])
    .onSuccess((event) => {
      const otp = event.target.otp.value;
      const email = event.target.email.value;
      const dataFinal = {
        email: email,
        otp: otp,
      }
      fetch(`/admin/account/otp-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dataFinal),
      })
        .then(res => res.json())
        .then(data => {
          if (data.code === 'error') {
            notyf.error(data.message); // In ra thông báo lỗi khi ko bị load lại trang
          }
          if (data.code === 'success') {
            console.log(data)
            //notyf.success(data.message); // In ra thông báo thành công khi ko bị load lại trang
            drawNotyf(data.code, data.message);// In ra thông báo thành công khi bị load lại trang
            window.location.href = `/${pathAdmin}/account/reset-password`;
          }
        })
    });
}

// End validate OTP password form

// Validate reset password form
const resetPasswordForm = document.querySelector('.form-account #reset-password-form');
if (resetPasswordForm) {
  const validator = new JustValidate('#reset-password-form');
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
      const passWord = event.target.password.value;
      const finalData = {
        passWord: passWord,
      }
      fetch(`/admin/account/reset-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(finalData),
      })
        .then(res => res.json())
        .then(data => {
          if (data.code === 'error') {
            notyf.error(data.message); // In ra thông báo lỗi khi ko bị load lại trang
          }
          if (data.code === 'success') {
            console.log(data)
            //notyf.success(data.message); // In ra thông báo thành công khi ko bị load lại trang
            drawNotyf(data.code, data.message);// In ra thông báo thành công khi bị load lại trang
            window.location.href = `/${pathAdmin}/dashboard`;
          }
        })
    });
}

// End validate reset password form
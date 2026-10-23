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
      fetch(`/account/login`, {
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
            window.location.href = `/`;
          }
        })
    });
}
// End validate login form

// Validate register form
const registerForm = document.querySelector('.form-account #register-form')
if(registerForm) {
    const validator = new JustValidate('#register-form');
    validator
        .addField("#fullName", [
            {
                rule: "required",
                message: "Vui lòng nhập họ tên"
            },
            {
                rule: "minLength",
                value: 5,
                errorMessage: "Tên tối thiểu 5 ký tự!",                
            },
            {
                rule: "maxLength",
                value: 50,
                errorMessage: "Họ và tên không được quá 50 ký tự!",
            }
        ])
        .addField("#email", [
            {
                rule: "required",
                message: "Vui lòng nhập email",
            },
            {
                rule: "email",
                message: "Email không hợp lệ",
            }
        ])
        .addField("#password", [
            {
                rule: "required",
                message: "Vui lòng nhập mật khẩu",
            },
            {
                rule: "strongPassword",
                errorMessage: (value) =>{
                    let html = ``;
                    if(value.length < 8) {
                        html += `Mật khẩu phải có ít nhất 8 ký tự <br>`;
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
                rule: "required",
                message: "Vui lòng đồng ý với điều khoản"
            }
        ])
        .onSuccess((event) => {
            const fullName = event.target.fullName.value;
            const email = event.target.email.value;
            const password = event.target.password.value;
            const dataFinal = {
                fullName: fullName,
                passWord: password,
            }
            fetch(`/account/register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dataFinal),
            })
                .then(res => res.json())
                .then(data => {
                    if(data.code == 'error') {
                        notyf.error(data.message);
                    }
                    if(data.code == 'success') {
                        console.log(data);
                        drawNotyf(data.code, data.message);
                        window.location.href = `/account/otp-verification?email=${email}`;
                    }

                })
        })
}
// End Validate register form

// Validate forgot password form
const forgotPasswordForm = document.querySelector('.form-account #forgot-password-form');
if(forgotPasswordForm){
    const validator = new JustValidate('#forgot-password-form');
    validator
        .addField('#email', [
            {
                rule: "required",
                message: "Vui lòng nhập email",
            },
            {
                rule: "email",
                message: "Email không hợp lệ",
            }
        ])
        .onSuccess((event) => {
            const email = event.target.email.value;
            const dataFinal = {
                email: email,
            }
            fetch(`/account/forgot-password`, {
                method: "POST",
                headers:{
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dataFinal),
            })
                .then(res => res.json())
                .then(data => {
                    if(data.code == 'error') {
                        notyf.error(data.message);
                    }
                    if(data.code == 'success') {
                        drawNotyf(data.code, data.message);
                        window.location.href = `/account/otp-verification?email=${email}`;
                    }
                })
        })
}
//Validate forgot password form

// Validate OTP form
const otpVerificationForm = document.querySelector('.form-account #otp-verification-form');
if(otpVerificationForm){
    const validator = new JustValidate('#otp-verification-form');
    validator
        .addField('#otp', [
            {
                rule: "required",
                message: "Vui lòng nhập mã OTP",
            }
        ])
        .onSuccess((event) => {
            const otp = event.target.otp.value;
            const email = event.target.email.value;
            const dataFinal = {
                email: email,
                otp: otp,
            }
            fetch(`/account/otp-verification`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dataFinal),
            })
                .then(res => res.json())
                .then(data => {
                    if(data.code == 'error') {
                        notyf.error(data.message);
                    }
                    if(data.code == 'success') {
                        drawNotyf(data.code, data.message);
                        if(data.purpose == 'register') window.location.href = `/account/login`;
                        if(data.purpose == 'forgot-password') window.location.href = `/account/reset-password`;
                    }
                })
        });
}
// End Validate OTP form

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
      fetch(`/account/reset-password`, {
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
            window.location.href = `/account/login`;
          }
        })
    });
}
// End Validate reset password form

// Validate login with google
async function handleGoogleCredential(response) {
    try {
        const googleIdToken = response.credential;
        if (!googleIdToken) {
            notyf.error("Không nhận được thông tin xác thực từ Google!");
            return;
        }
        const result = await fetch("/account/auth/google", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                credential: googleIdToken
            })
        });

        const data = await result.json();
        if (data.code === "error") {
            notyf.error(data.message);
            return;
        }
        if (data.code === "complete-register") {
            window.location.href = "/account/complete-register";
            return;
        }
        if (data.code === "success") {
            drawNotyf(
                data.code,
                data.message
            );
            window.location.href = "/";
        }
    } catch (error) {
        console.error("Google Login Error:", error);
        notyf.error(
            "Đã xảy ra lỗi khi đăng nhập bằng Google!"
        );
    }
}
// End validate login with google

// Validate completeRegister form
const completeRegisterForm = document.querySelector('.form-account #complete-register-form')
if(completeRegisterForm) {
    const validator = new JustValidate('#complete-register-form');
    validator
        .addField("#fullName", [
            {
                rule: "required",
                message: "Vui lòng nhập họ tên"
            },
            {
                rule: "minLength",
                value: 5,
                errorMessage: "Tên tối thiểu 5 ký tự!",                
            },
            {
                rule: "maxLength",
                value: 50,
                errorMessage: "Họ và tên không được quá 50 ký tự!",
            }
        ])
        .addField("#password", [
            {
                rule: "required",
                message: "Vui lòng nhập mật khẩu",
            },
            {
                rule: "strongPassword",
                errorMessage: (value) =>{
                    let html = ``;
                    if(value.length < 8) {
                        html += `Mật khẩu phải có ít nhất 8 ký tự <br>`;
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
                rule: "required",
                message: "Vui lòng đồng ý với điều khoản"
            }
        ])
        .onSuccess((event) => {
            const fullName = event.target.fullName.value;
            const email = event.target.email.value;
            const password = event.target.password.value;
            const dataFinal = {
                fullName: fullName,
                email: email,
                passWord: password,
            }
            fetch(`/account/complete-register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(dataFinal),
            })
                .then(res => res.json())
                .then(data => {
                    if(data.code == 'error') {
                        notyf.error(data.message);
                    }
                    if(data.code == 'success') {
                        console.log(data);
                        drawNotyf(data.code, data.message);
                        window.location.href = `/account/otp-verification?email=${email}`;
                    }

                })
        })
}
// End Validate register form
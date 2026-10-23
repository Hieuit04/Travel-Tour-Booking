// ==========================================
// Profile Page Interactive JavaScript
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  const profileForm = document.querySelector("#profileEditForm");
  const btnStartEdit = document.querySelector("#btnStartEdit");
  const btnCancelEdit = document.querySelector("#btnCancelEdit");
  const btnSaveEdit = document.querySelector("#btnSaveEdit");

  const avatarInput = document.querySelector("#avatarInput");
  const profileAvatarImg = document.querySelector("#profileAvatarImg");

  const inputFullName = document.querySelector("#inputFullName");
  const inputPhone = document.querySelector("#inputPhone");
  const inputEmail = document.querySelector("#inputEmail");

  const valFullName = document.querySelector("#valFullName");
  const valPhone = document.querySelector("#valPhone");
  const valEmail = document.querySelector("#valEmail");
  const displayFullName = document.querySelector("#displayFullName");

  const errFullName = document.querySelector("#errFullName");
  const errPhone = document.querySelector("#errPhone");
  const errEmail = document.querySelector("#errEmail");

  if (!profileForm || !btnStartEdit) return;

  // Store initial values to revert on Cancel
  let originalValues = {
    fullName: inputFullName ? inputFullName.value : "",
    phone: inputPhone ? inputPhone.value : "",
    email: inputEmail ? inputEmail.value : "",
    avatarSrc: profileAvatarImg ? profileAvatarImg.src : ""
  };

  let selectedAvatarFile = null;

  // Toggle Edit Mode
  const enterEditMode = () => {
    profileForm.classList.add("is-editing");
    btnStartEdit.style.display = "none";
    clearErrors();
  };

  const exitEditMode = () => {
    profileForm.classList.remove("is-editing");
    btnStartEdit.style.display = "inline-flex";
    clearErrors();
  };

  // Revert inputs on Cancel
  const cancelEdit = () => {
    if (inputFullName) inputFullName.value = originalValues.fullName;
    if (inputPhone) inputPhone.value = originalValues.phone;
    if (inputEmail) inputEmail.value = originalValues.email;
    if (profileAvatarImg) profileAvatarImg.src = originalValues.avatarSrc;

    // Reset file input
    if (avatarInput) avatarInput.value = "";
    selectedAvatarFile = null;

    exitEditMode();
  };

  // Clear validation errors
  const clearErrors = () => {
    [errFullName, errPhone, errEmail].forEach((el) => {
      if (el) {
        el.textContent = "";
        el.style.display = "none";
      }
    });
    [inputFullName, inputPhone, inputEmail].forEach((el) => {
      if (el) el.classList.remove("has-error");
    });
  };

  // Show error for a field
  const setError = (inputEl, errorEl, message) => {
    if (inputEl) inputEl.classList.add("has-error");
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.style.display = "block";
    }
  };

  // Attach button events
  btnStartEdit.addEventListener("click", () => {
    enterEditMode();
    if (inputFullName) inputFullName.focus();
  });

  if (btnCancelEdit) {
    btnCancelEdit.addEventListener("click", (e) => {
      e.preventDefault();
      cancelEdit();
    });
  }

  // Handle Avatar Change & Preview
  if (avatarInput && profileAvatarImg) {
    avatarInput.addEventListener("change", (e) => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      // Validate file type & size (5MB limit)
      const validTypes = ["image/jpeg", "image/png", "image/jpg", "image/webp"];
      if (!validTypes.includes(file.type)) {
        if (typeof notyf !== "undefined") {
          notyf.error("Vui lòng chọn file hình ảnh (JPG, PNG, WEBP)!");
        } else {
          alert("Vui lòng chọn file hình ảnh (JPG, PNG, WEBP)!");
        }
        avatarInput.value = "";
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        if (typeof notyf !== "undefined") {
          notyf.error("Dung lượng ảnh tối đa là 5MB!");
        } else {
          alert("Dung lượng ảnh tối đa là 5MB!");
        }
        avatarInput.value = "";
        return;
      }

      selectedAvatarFile = file;

      // Local preview
      const reader = new FileReader();
      reader.onload = (event) => {
        profileAvatarImg.src = event.target.result;
      };
      reader.readAsDataURL(file);

      // Auto-enter edit mode if not already editing so user can save or cancel
      if (!profileForm.classList.contains("is-editing")) {
        enterEditMode();
      }

      if (typeof notyf !== "undefined") {
        notyf.success("Đã chọn ảnh mới. Nhấn 'Lưu thay đổi' để hoàn tất!");
      }
    });
  }

  // Handle Form Submit
  profileForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();

    const fullNameVal = inputFullName ? inputFullName.value.trim() : "";
    const phoneVal = inputPhone ? inputPhone.value.trim() : "";
    const emailVal = inputEmail ? inputEmail.value.trim() : "";

    let hasError = false;

    // Validate Full Name
    if (!fullNameVal) {
      setError(inputFullName, errFullName, "Vui lòng nhập họ và tên!");
      hasError = true;
    }

    // Validate Phone (10 digits starting with 0)
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneVal) {
      setError(inputPhone, errPhone, "Vui lòng nhập số điện thoại!");
      hasError = true;
    } else if (!phoneRegex.test(phoneVal)) {
      setError(inputPhone, errPhone, "Số điện thoại không đúng định dạng!");
      hasError = true;
    }

    // Validate Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailVal) {
      setError(inputEmail, errEmail, "Vui lòng nhập địa chỉ email!");
      hasError = true;
    } else if (!emailRegex.test(emailVal)) {
      setError(inputEmail, errEmail, "Email không hợp lệ!");
      hasError = true;
    }

    if (hasError) return;

    // Build FormData
    const formData = new FormData();
    formData.append("fullName", fullNameVal);
    formData.append("phone", phoneVal);
    formData.append("email", emailVal);

    if (selectedAvatarFile) {
      formData.append("avatar", selectedAvatarFile);
    }

    // Disable Save button while processing
    if (btnSaveEdit) {
      btnSaveEdit.disabled = true;
      btnSaveEdit.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>Đang lưu...</span>`;
    }

    try {
      const response = await fetch("/profile/edit", {
        method: "PATCH",
        body: formData
      });

      const result = await response.json();

      if (result.code === "success") {
        // Update display text values
        if (valFullName) valFullName.textContent = fullNameVal;
        if (valPhone) valPhone.textContent = phoneVal;
        if (valEmail) valEmail.textContent = emailVal;
        if (displayFullName) displayFullName.textContent = fullNameVal;

        // Update header user info if present
        const headerName = document.querySelector(".user-account .user-fullname");
        if (headerName) headerName.textContent = fullNameVal;

        if (result.data && result.data.avatar) {
          const headerAvatar = document.querySelector(".user-account .inner-icon-login");
          if (headerAvatar) headerAvatar.src = result.data.avatar;
          if (profileAvatarImg) profileAvatarImg.src = result.data.avatar;
        }

        // Update stored original values
        originalValues = {
          fullName: fullNameVal,
          phone: phoneVal,
          email: emailVal,
          avatarSrc: profileAvatarImg ? profileAvatarImg.src : originalValues.avatarSrc
        };

        selectedAvatarFile = null;
        if (avatarInput) avatarInput.value = "";

        exitEditMode();

        if (typeof notyf !== "undefined") {
          notyf.success(result.message || "Cập nhật thông tin thành công!");
        } else {
          alert(result.message || "Cập nhật thông tin thành công!");
        }
      } else {
        if (typeof notyf !== "undefined") {
          notyf.error(result.message || "Có lỗi xảy ra khi cập nhật!");
        } else {
          alert(result.message || "Có lỗi xảy ra khi cập nhật!");
        }
      }
    } catch (err) {
      console.error("Profile submit error:", err);
      if (typeof notyf !== "undefined") {
        notyf.error("Có lỗi xảy ra khi gửi dữ liệu!");
      } else {
        alert("Có lỗi xảy ra khi gửi dữ liệu!");
      }
    } finally {
      if (btnSaveEdit) {
        btnSaveEdit.disabled = false;
        btnSaveEdit.innerHTML = `<i class="fa-solid fa-check"></i> <span>Lưu thay đổi</span>`;
      }
    }
  });
});

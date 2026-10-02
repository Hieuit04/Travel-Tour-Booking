// Promotion JS

const promotionSelectedList = document.querySelector('#promotion-selected-list');
if (promotionSelectedList) {
  // Biến lưu trữ các tour đã chọn
  const selectedTourIds = new Set();
  
  // Nạp sẵn ID các tour đã chọn (dùng cho trang Edit) và gắn sự kiện xoá
  const existingRows = promotionSelectedList.querySelectorAll('.inner-selected-row');
  existingRows.forEach(row => {
    const id = row.getAttribute('data-tour-id');
    if (id) {
      selectedTourIds.add(id);
      
      const btnRemove = row.querySelector('.btn-remove-selected');
      if (btnRemove) {
        btnRemove.addEventListener('click', () => {
          selectedTourIds.delete(id.toString());
          row.remove();
          syncTableButtonStates();
          updateBulkButton();
        });
      }
    }
  });
  
  // Các phần tử DOM
  const tourTbody = document.querySelector('#promotion-tour-tbody');
  const paginationEl = document.querySelector('#promotion-tour-pagination');
  const bulkBtn = document.querySelector('#btn-add-selected-tours');
  const checkAllTours = document.querySelector('#check-all-tours');
  
  // Form bộ lọc
  const filterStatus = document.querySelector('#filter-status');
  const filterCreatedBy = document.querySelector('#filter-createdBy');
  const filterCategory = document.querySelector('#filter-category');
  const filterKeyword = document.querySelector('#filter-keyword');
  const btnResetFilter = document.querySelector('#btn-reset-filter');

  // Hàm định dạng giá
  const formatPrice = (n) => parseInt(n || 0).toLocaleString('vi-VN');

  // Hàm đồng bộ trạng thái các nút "Thêm vào ưu đãi" trong bảng
  const syncTableButtonStates = () => {
    const listBtnAdd = document.querySelectorAll('.btn-add-to-promotion');
    listBtnAdd.forEach(btn => {
      const id = btn.getAttribute('data-tour-id');
      if (selectedTourIds.has(id)) {
        btn.disabled = true;
        btn.classList.add('btn-added');
        btn.innerHTML = '<i class="fa-solid fa-check"></i> Đã thêm';
      } else {
        btn.disabled = false;
        btn.classList.remove('btn-added');
        btn.innerHTML = '<i class="fa-solid fa-plus"></i> Thêm vào ưu đãi';
      }
    });
  };

  // Hàm cập nhật nút thêm nhiều
  const updateBulkButton = () => {
    if (!bulkBtn) return;
    const count = document.querySelectorAll('.tour-checkbox:checked').length;
    bulkBtn.disabled = count === 0;
    
    const spanCount = bulkBtn.querySelector('span');
    if (spanCount) {
      spanCount.innerHTML = ` Thêm tour đã chọn (${count})`;
    }
  };

  // Hàm tạo thẻ dòng tour đã chọn
  const createSelectedRow = (tour) => {
    const row = document.createElement('div');
    row.classList.add('inner-selected-row');
    row.setAttribute('data-tour-id', tour.id);
    row.innerHTML = `
      <input type="hidden" name="tourId[]" value="${tour.id}">
      <div class="inner-selected-name">${tour.tourName}</div>
      <div class="inner-selected-prices">
        <div class="inner-price-group">
          <label>Người lớn (NL)</label>
          <div class="inner-price-input-wrap">
            <span class="inner-price-old">${formatPrice(tour.priceAdult)} đ</span>
            <input type="number" name="specialPriceAdult[]" placeholder="Giá ưu đãi NL" class="inner-price-input" min="0">
          </div>
        </div>
        <div class="inner-price-group">
          <label>Trẻ em (TE)</label>
          <div class="inner-price-input-wrap">
            <span class="inner-price-old">${formatPrice(tour.priceChildren)} đ</span>
            <input type="number" name="specialPriceChildren[]" placeholder="Giá ưu đãi TE" class="inner-price-input" min="0">
          </div>
        </div>
        <div class="inner-price-group">
          <label>Em bé (EB)</label>
          <div class="inner-price-input-wrap">
            <span class="inner-price-old">${formatPrice(tour.priceBaby)} đ</span>
            <input type="number" name="specialPriceBaby[]" placeholder="Giá ưu đãi EB" class="inner-price-input" min="0">
          </div>
        </div>
        <div class="inner-price-group">
          <label>Số vé ưu đãi</label>
          <input type="number" name="stockLimit[]" placeholder="VD: 10" class="inner-price-input" min="0">
        </div>
      </div>
      <button type="button" class="btn-remove-selected" title="Xoá khỏi ưu đãi">
        <i class="fa-regular fa-trash-can"></i>
      </button>
    `;

    // Lắng nghe sự kiện xoá khỏi danh sách
    const btnRemove = row.querySelector('.btn-remove-selected');
    if (btnRemove) {
      btnRemove.addEventListener('click', () => {
        selectedTourIds.delete(tour.id.toString());
        row.remove();
        syncTableButtonStates();
        updateBulkButton();
      });
    }
    
    return row;
  };

  // Hàm thêm 1 tour vào danh sách ưu đãi
  const addTourToSelected = (tour) => {
    const tourIdStr = tour.id.toString();
    if (!selectedTourIds.has(tourIdStr)) {
      selectedTourIds.add(tourIdStr);
      const newRow = createSelectedRow(tour);
      promotionSelectedList.appendChild(newRow);
      promotionSelectedList.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  // Hàm load danh sách tour bằng AJAX
  const loadTours = async (page = 1) => {
    if (!tourTbody) return;

    // Lấy giá trị các bộ lọc
    const filters = {};
    if (filterStatus && filterStatus.value) filters.status = filterStatus.value;
    if (filterCreatedBy && filterCreatedBy.value) filters.createdBy = filterCreatedBy.value;
    if (filterCategory && filterCategory.value) filters.category = filterCategory.value;
    if (filterKeyword && filterKeyword.value.trim()) filters.keyword = filterKeyword.value.trim();

    const params = new URLSearchParams({ page, ...filters });
    
    try {
      const res = await fetch(`/${pathAdmin}/promotion/tours?${params.toString()}`);
      const data = await res.json();

      if (data.code !== 'success') {
        tourTbody.innerHTML = `<tr><td colspan="9" class="text-center text-danger">Lỗi tải dữ liệu!</td></tr>`;
        return;
      }

      const tourList = data.tourList;
      const pagination = data.pagination;

      // Render danh sách tour
      if (tourList.length === 0) {
        tourTbody.innerHTML = `<tr><td colspan="9" class="text-center text-muted py-3">Không tìm thấy tour nào!</td></tr>`;
      } else {
        const htmls = tourList.map(tour => {
          return `
            <tr data-tour-id="${tour.id}" data-tour-name="${tour.tourName}" data-price-adult="${tour.priceAdult}" data-price-children="${tour.priceChildren}" data-price-baby="${tour.priceBaby}">
              <td><input type="checkbox" class="tour-checkbox" data-tour-id="${tour.id}"></td>
              <td>${tour.tourName}</td>
              <td><img src="${tour.avatar || ''}" class="inner-avatar" onerror="this.src=''"></td>
              <td>
                <div>NL: ${formatPrice(tour.priceAdult)}đ</div>
                <div>TE: ${formatPrice(tour.priceChildren)}đ</div>
                <div>EB: ${formatPrice(tour.priceBaby)}đ</div>
              </td>
              <td>
                <div>NL: ${tour.stockAdult}</div>
                <div>TE: ${tour.stockChildren}</div>
                <div>EB: ${tour.stockBaby}</div>
              </td>
              <td>${tour.position}</td>
              <td>
                <span class="tag ${tour.status === 'active' ? 'tag-green' : 'tag-red'}">
                  ${tour.status === 'active' ? 'Hoạt động' : 'Tạm dừng'}
                </span>
              </td>
              <td>
                <div>${tour.createdByName || ''}</div>
                <div class="inner-time">${tour.createdAtFormat || ''}</div>
              </td>
              <td>
                <button type="button" class="btn-add-to-promotion" data-tour-id="${tour.id}">
                  <i class="fa-solid fa-plus"></i> Thêm vào ưu đãi
                </button>
              </td>
            </tr>
          `;
        });
        tourTbody.innerHTML = htmls.join('');
      }

      // Cập nhật giao diện
      syncTableButtonStates();
      if (checkAllTours) checkAllTours.checked = false;
      updateBulkButton();

      // Render phân trang
      if (paginationEl) {
        const showing = Math.min(pagination.skip + tourList.length, pagination.totalRecord);
        const innerText = paginationEl.querySelector('.inner-text');
        if (innerText) {
          innerText.innerHTML = `Hiển thị ${pagination.skip + 1} - ${showing} của ${pagination.totalRecord}`;
        }

        const ajaxPagination = paginationEl.querySelector('#ajax-pagination');
        if (ajaxPagination) {
          let pagesHtml = '';
          for (let i = 1; i <= pagination.totalPages; i++) {
            pagesHtml += `<option value="${i}" ${i === page ? 'selected' : ''}>Trang ${i}</option>`;
          }
          ajaxPagination.innerHTML = pagesHtml;
        }

      }
    } catch (error) {
      console.error(error);
      if (typeof notyf !== 'undefined') notyf.error('Lỗi kết nối server!');
    }
  };

  // Load danh sách lần đầu
  loadTours(1);

  // Bắt sự kiện chuyển trang bằng select
  const ajaxPagination = document.querySelector('#ajax-pagination');
  if (ajaxPagination) {
    ajaxPagination.addEventListener('change', (e) => {
      const pageNumber = parseInt(e.target.value);
      if (pageNumber) loadTours(pageNumber);
    });
  }

  // Bắt sự kiện bộ lọc thay đổi
  const applyFilters = () => loadTours(1);
  if (filterStatus) filterStatus.addEventListener('change', applyFilters);
  if (filterCreatedBy) filterCreatedBy.addEventListener('change', applyFilters);
  if (filterCategory) filterCategory.addEventListener('change', applyFilters);
  
  if (filterKeyword) {
    let searchTimer;
    filterKeyword.addEventListener('input', () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(applyFilters, 400);
    });
  }

  // Xóa bộ lọc
  if (btnResetFilter) {
    btnResetFilter.addEventListener('click', () => {
      if (filterStatus) filterStatus.value = '';
      if (filterCreatedBy) filterCreatedBy.value = '';
      if (filterCategory) filterCategory.value = '';
      if (filterKeyword) filterKeyword.value = '';
      loadTours(1);
    });
  }

  // Checkbox Check All
  if (checkAllTours) {
    checkAllTours.addEventListener('change', (e) => {
      const listCheckbox = document.querySelectorAll('.tour-checkbox');
      listCheckbox.forEach(cb => {
        cb.checked = e.target.checked;
      });
      updateBulkButton();
    });
  }

  // Lắng nghe sự kiện click/change trong tbody (dùng event delegation)
  if (tourTbody) {
    // Khi check 1 tour
    tourTbody.addEventListener('change', (e) => {
      if (e.target.classList.contains('tour-checkbox')) {
        updateBulkButton();
        const allChecked = document.querySelectorAll('.tour-checkbox:not(:checked)').length === 0;
        if (checkAllTours) checkAllTours.checked = allChecked;
      }
    });

    // Khi bấm nút Thêm vào ưu đãi
    tourTbody.addEventListener('click', (e) => {
      const btn = e.target.closest('.btn-add-to-promotion');
      if (btn) {
        const tr = btn.closest('tr');
        if (tr) {
          const tour = {
            id: tr.getAttribute('data-tour-id'),
            tourName: tr.getAttribute('data-tour-name'),
            priceAdult: tr.getAttribute('data-price-adult'),
            priceChildren: tr.getAttribute('data-price-children'),
            priceBaby: tr.getAttribute('data-price-baby'),
          };
          addTourToSelected(tour);
          syncTableButtonStates();
        }
      }
    });
  }

  // Nút Thêm nhiều tour đã chọn
  if (bulkBtn) {
    bulkBtn.addEventListener('click', () => {
      const checkedBoxes = document.querySelectorAll('.tour-checkbox:checked');
      checkedBoxes.forEach(cb => {
        const tr = cb.closest('tr');
        if (tr) {
          const tour = {
            id: tr.getAttribute('data-tour-id'),
            tourName: tr.getAttribute('data-tour-name'),
            priceAdult: tr.getAttribute('data-price-adult'),
            priceChildren: tr.getAttribute('data-price-children'),
            priceBaby: tr.getAttribute('data-price-baby'),
          };
          addTourToSelected(tour);
          cb.checked = false; // Bỏ check sau khi thêm
        }
      });
      syncTableButtonStates();
      updateBulkButton();
      if (checkAllTours) checkAllTours.checked = false;
    });
  }

  // Submit form tạo / sửa khuyến mãi
  const promotionForm = document.querySelector('#promotion-create-form') || document.querySelector('#promotion-edit-form');
  if (promotionForm) {
    promotionForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      // Đồng bộ dữ liệu từ TinyMCE (nếu có) vào textarea trước khi lấy FormData
      if (typeof tinymce !== 'undefined') {
        tinymce.triggerSave();
      }

      const formData = new FormData(promotionForm);
      
      // Lấy dữ liệu các ô input động trong danh sách ưu đãi
      const listInputSelected = document.querySelectorAll('#promotion-selected-list input');
      listInputSelected.forEach(input => {
        if (input.name) {
          formData.append(input.name, input.value);
        }
      });

      // Chuyển FormData thành mảng Object dễ đọc
      const body = {};
      for (const [key, value] of formData.entries()) {
        if (key.endsWith('[]')) {
          const cleanKey = key.slice(0, -2);
          if (!body[cleanKey]) body[cleanKey] = [];
          body[cleanKey].push(value);
        } else {
          body[key] = value;
        }
      }

      // Xác định là trang Create hay Edit bằng getAttribute thay vì .id (để tránh bị đè bởi input name="id")
      const isEdit = promotionForm.getAttribute('id') === 'promotion-edit-form';
      const url = isEdit ? `/${pathAdmin}/promotion/edit/${body.id}` : `/${pathAdmin}/promotion/create`;
      const method = isEdit ? 'PATCH' : 'POST';

      try {
        const response = await fetch(url, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await response.json();
        
        if (data.code === 'success') {
          // Dùng hàm drawNotyf (có sẵn) để hiện thông báo mượt mà sau khi reload
          if (typeof drawNotyf !== 'undefined') {
            drawNotyf('success', data.message);
          } else {
            alert(data.message);
          }
          window.location.href = `/${pathAdmin}/promotion/list`;
        } else {
          // Báo lỗi ngay tại chỗ bằng notyf
          if (typeof notyf !== 'undefined') {
            notyf.error(data.message || 'Có lỗi xảy ra!');
          } else {
            alert(data.message || 'Có lỗi xảy ra!');
          }
        }
      } catch (err) {
        console.error(err);
        if (typeof notyf !== 'undefined') {
          notyf.error('Lỗi kết nối server!');
        } else {
          alert('Lỗi kết nối server!');
        }
      }
    });
  }
}
// End Promotion JS

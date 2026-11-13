/* ==========================================================================
   VOUCHRA MATCHDESK CONTROLLER (SWISS AUDIT DESK)
   - On-page Drag & Drop upload & sample runner
   - 3-Way line item mismatch inspection
   - Automated debit note generation
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initMatchDesk();
});

const DEFAULT_SAMPLE_PACKET = {
  id: 'VCH-8821',
  vendor: 'Flour Mills of Nigeria Plc (Golden Penny)',
  buyer: 'FoodCo Nigeria Ltd — Store #04 (Dugbe, Ibadan)',
  date: '12 Nov 2026',
  invoiceNo: 'FMN-INV-99042',
  waybillNo: 'GRN-IB-4418',
  poNo: 'PO-2026-8812',
  status: 'Flagged (Discrepancy)',
  totalInvoiced: '₦4,750,000',
  totalApproved: '₦3,864,000',
  leakagePrevented: '₦886,000',
  items: [
    {
      description: 'Golden Penny Confectionery Flour 50kg',
      poQty: 100,
      poPrice: 42000,
      grnQty: 92,
      invQty: 100,
      invPrice: 47500,
      variance: '-8 bags short & +₦5,500/bag unit hike',
      leakage: '₦886,000',
      status: 'Exception Flagged'
    },
    {
      description: 'Golden Penny Semovita 10kg (Bale of 5)',
      poQty: 50,
      poPrice: 18500,
      grnQty: 50,
      invQty: 50,
      invPrice: 18500,
      variance: '0 (Exact Match)',
      leakage: '₦0',
      status: 'Cleared'
    }
  ]
};

function initMatchDesk() {
  const urlParams = new URLSearchParams(window.location.search);
  const requestedPacket = urlParams.get('packet');
  const isAuth = localStorage.getItem('vouchra_auth_session') === 'true';

  if (!isAuth && !requestedPacket) {
    loadSpecimenMode(DEFAULT_SAMPLE_PACKET);
  } else if (!isAuth && requestedPacket) {
    loadSpecimenMode(DEFAULT_SAMPLE_PACKET);
  } else {
    loadAuthenticatedMode();
  }

  // Debit Note Action
  const debitBtn = document.getElementById('btn-issue-debit-note');
  if (debitBtn) {
    debitBtn.addEventListener('click', () => {
      debitBtn.innerHTML = '<span>✓ DEBIT NOTE DN-8821 ISSUED (₦886,000 DEDUCTED)</span>';
      debitBtn.style.background = 'var(--swiss-green)';
      debitBtn.style.borderColor = 'var(--swiss-green)';
      debitBtn.style.color = '#FFFFFF';
      debitBtn.disabled = true;

      const statusBadge = document.getElementById('packet-status-badge');
      if (statusBadge) {
        statusBadge.textContent = '■ RESOLVED: DEBIT NOTE DN-8821 POSTED TO ERP SCHEDULE';
        statusBadge.style.color = 'var(--swiss-green)';
      }
    });
  }

  initUploadZone();
}

function loadSpecimenMode(packet) {
  const authControls = document.querySelectorAll('.auth-only');
  const guestBanner = document.getElementById('guest-specimen-banner');
  const userGreeting = document.getElementById('user-greeting');

  authControls.forEach(el => el.style.display = 'none');
  if (guestBanner) guestBanner.style.display = 'flex';
  if (userGreeting) userGreeting.textContent = 'Guest Specimen Reviewer';

  populatePacketDetails(packet);
}

function loadAuthenticatedMode() {
  const authControls = document.querySelectorAll('.auth-only');
  const guestBanner = document.getElementById('guest-specimen-banner');
  const userGreeting = document.getElementById('user-greeting');
  const storedUser = localStorage.getItem('vouchra_user_name') || 'Procurement Auditor';
  const storedCompany = localStorage.getItem('vouchra_user_company') || 'Enterprise Operations';

  authControls.forEach(el => el.style.display = 'inline-flex');
  if (guestBanner) guestBanner.style.display = 'none';
  if (userGreeting) userGreeting.textContent = `${storedUser} [ ${storedCompany} ]`;

  const savedPackets = JSON.parse(localStorage.getItem('vouchra_packets') || '[]');
  const emptyState = document.getElementById('empty-ledger-state');
  const packetViewer = document.getElementById('packet-detail-view');
  const countBadge = document.getElementById('stats-total-packets');

  if (savedPackets.length === 0) {
    if (emptyState) emptyState.style.display = 'flex';
    if (packetViewer) packetViewer.style.display = 'none';
    if (countBadge) countBadge.textContent = '0 PACKETS';
  } else {
    if (emptyState) emptyState.style.display = 'none';
    if (packetViewer) packetViewer.style.display = 'flex';
    populatePacketDetails(savedPackets[0]);
    if (countBadge) countBadge.textContent = `${savedPackets.length} PACKET(S)`;
  }

  const signOutBtn = document.getElementById('btn-signout');
  if (signOutBtn) {
    signOutBtn.addEventListener('click', () => {
      localStorage.removeItem('vouchra_auth_session');
      window.location.href = 'index.html';
    });
  }
}

function populatePacketDetails(packet) {
  const elVendor = document.getElementById('packet-vendor-name');
  const elBuyer = document.getElementById('packet-buyer-name');
  const elInvoiceNo = document.getElementById('packet-inv-no');
  const elWaybillNo = document.getElementById('packet-waybill-no');
  const elTotalInv = document.getElementById('packet-total-inv');
  const elTotalApp = document.getElementById('packet-total-app');
  const elLeakage = document.getElementById('packet-leakage');

  if (elVendor) elVendor.textContent = packet.vendor;
  if (elBuyer) elBuyer.textContent = packet.buyer;
  if (elInvoiceNo) elInvoiceNo.textContent = packet.invoiceNo;
  if (elWaybillNo) elWaybillNo.textContent = packet.waybillNo;
  if (elTotalInv) elTotalInv.textContent = packet.totalInvoiced;
  if (elTotalApp) elTotalApp.textContent = packet.totalApproved;
  if (elLeakage) elLeakage.textContent = packet.leakagePrevented;

  const tbody = document.getElementById('items-tbody');
  if (tbody && packet.items) {
    tbody.innerHTML = packet.items.map(it => `
      <tr>
        <td style="font-weight: 700; color: var(--ink);">${it.description}</td>
        <td class="mono" style="text-align: center; color: var(--ink-secondary);">${it.poQty}</td>
        <td class="mono" style="text-align: center; color: var(--ink-secondary);">${it.grnQty}</td>
        <td class="mono" style="text-align: center; color: var(--ink-secondary);">${it.invQty}</td>
        <td class="mono" style="font-size: 12px; color: ${it.variance.includes('short') ? 'var(--swiss-red)' : 'var(--ink-secondary)'}; font-weight: 700;">${it.variance}</td>
        <td class="mono" style="font-size: 13.5px; font-weight: 800; color: ${it.leakage !== '₦0' ? 'var(--swiss-red)' : 'var(--ink-muted)'}; text-align: right;">${it.leakage}</td>
      </tr>
    `).join('');
  }
}

function initUploadZone() {
  const dropzone = document.getElementById('upload-zone-section');
  const fileInput = document.getElementById('file-doc-input');
  const sampleBtn = document.getElementById('btn-run-sample-upload');
  const progressBox = document.getElementById('ocr-progress-box');
  const progressFill = document.getElementById('ocr-progress-fill');
  const statusText = document.getElementById('ocr-status-text');
  const percentText = document.getElementById('ocr-percent-text');

  if (!dropzone) return;

  // Drag and drop styles
  ['dragenter', 'dragover'].forEach(evt => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.add('drag-over');
    });
  });

  ['dragleave', 'drop'].forEach(evt => {
    dropzone.addEventListener(evt, (e) => {
      e.preventDefault();
      dropzone.classList.remove('drag-over');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      triggerOcrProcessing();
    }
  });

  if (fileInput) {
    fileInput.addEventListener('change', () => {
      if (fileInput.files.length > 0) {
        triggerOcrProcessing();
      }
    });
  }

  if (sampleBtn) {
    sampleBtn.addEventListener('click', () => {
      triggerOcrProcessing();
    });
  }

  function triggerOcrProcessing() {
    if (progressBox) progressBox.style.display = 'flex';
    if (progressFill) progressFill.style.width = '15%';
    if (statusText) statusText.textContent = '1/3: AZURE DOCUMENT AI EXTRACTING PDF LINE ITEMS...';
    if (percentText) percentText.textContent = '25%';

    setTimeout(() => {
      if (progressFill) progressFill.style.width = '65%';
      if (statusText) statusText.textContent = '2/3: MATCHING PHYSICAL GATE STAMP COUNT AGAINST CONTRACT...';
      if (percentText) percentText.textContent = '65%';
    }, 700);

    setTimeout(() => {
      if (progressFill) progressFill.style.width = '100%';
      if (statusText) statusText.textContent = '3/3: EXCEPTION FLAGGED (-8 BAGS SHORT). AUTO-GENERATING DEBIT NOTE...';
      if (percentText) percentText.textContent = '100%';
    }, 1400);

    setTimeout(() => {
      const packets = [DEFAULT_SAMPLE_PACKET];
      localStorage.setItem('vouchra_packets', JSON.stringify(packets));
      if (progressBox) progressBox.style.display = 'none';
      loadAuthenticatedMode();

      // Scroll smoothly to the reconciled packet view
      const view = document.getElementById('packet-detail-view');
      if (view) view.scrollIntoView({ behavior: 'smooth' });
    }, 1900);
  }
}

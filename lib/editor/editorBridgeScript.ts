/**
 * iframe에 주입할 에디터 브리지 스크립트 (문자열).
 * GET /api/designs/[id]/html 에서 </body> 직전에 삽입.
 */
export const EDITOR_BRIDGE_SCRIPT = `
<script>
(function() {
  var SELECTOR_MAP = {
    headline:    '.section-title, .story-title, .cta-title, .statement-title, .overlay-title, .testimonial-title',
    subheadline: '.section-sub, .sensory-sub, .cta-sub, .statement-sub, .overlay-sub',
    body:        '.body-text, .story-body, .cta-tagline, .sensory-body, .statement-body, .testimonial-text, .overlay-body'
  };

  var ITEM_LABEL_SEL = '.info-title, .step-h-title, .feature-col-title, .timeline-title, .compare-label';
  var ITEM_VALUE_SEL = '.info-body, .step-h-body, .feature-col-body, .timeline-body';

  // 섹션 클릭 → Parent에 전달
  document.querySelectorAll('[data-editable="true"]').forEach(function(section) {
    section.style.cursor = 'pointer';
    section.addEventListener('click', function(e) {
      e.stopPropagation();
      window.parent.postMessage({
        type: 'SECTION_CLICK',
        sectionIndex: parseInt(section.dataset.sectionIndex),
        sectionType: section.dataset.sectionType,
        pattern: section.dataset.pattern
      }, location.origin);
    });

    section.addEventListener('mouseenter', function() {
      section.style.outline = '2px solid rgba(99,102,241,0.6)';
      section.style.outlineOffset = '-2px';
    });
    section.addEventListener('mouseleave', function() {
      section.style.outline = '';
      section.style.outlineOffset = '';
    });
  });

  // Parent 메시지 수신 (origin 검증)
  var allowedOrigin = location.origin;
  window.addEventListener('message', function(e) {
    if (e.origin !== allowedOrigin) return;
    if (!e.data || !e.data.type) return;

    switch (e.data.type) {
      case 'UPDATE_SECTION_TEXT':
        updateText(e.data.sectionIndex, e.data.field, e.data.value);
        break;
      case 'UPDATE_ITEM_TEXT':
        updateItem(e.data.sectionIndex, e.data.itemIndex, e.data.field, e.data.value);
        break;
      case 'UPDATE_CSS_VAR':
        document.documentElement.style.setProperty(e.data.varName, e.data.value);
        break;
      case 'REPLACE_IMAGE':
        replaceImage(e.data.sectionIndex, e.data.imageIndex, e.data.dataUrl);
        break;
      case 'HIGHLIGHT_SECTION':
        highlightSection(e.data.sectionIndex);
        break;
      case 'CLEAR_HIGHLIGHT':
        clearHighlight();
        break;
    }
  });

  function updateText(index, field, value) {
    var section = document.querySelector('[data-section-index="' + index + '"]');
    if (!section) return;
    var sel = SELECTOR_MAP[field];
    if (!sel) return;
    var el = section.querySelector(sel);
    if (el) el.textContent = value;
  }

  function updateItem(sectionIndex, itemIndex, field, value) {
    var section = document.querySelector('[data-section-index="' + sectionIndex + '"]');
    if (!section) return;
    var selector = field === 'label' ? ITEM_LABEL_SEL : ITEM_VALUE_SEL;
    var items = section.querySelectorAll(selector);
    if (items[itemIndex]) items[itemIndex].textContent = value;
  }

  function replaceImage(sectionIndex, imageIndex, dataUrl) {
    var section = document.querySelector('[data-section-index="' + sectionIndex + '"]');
    if (!section) return;
    var imgs = section.querySelectorAll('img');
    if (imgs[imageIndex]) imgs[imageIndex].src = dataUrl;
  }

  function highlightSection(index) {
    clearHighlight();
    var target = document.querySelector('[data-section-index="' + index + '"]');
    if (target) {
      target.style.outline = '3px solid #6366f1';
      target.style.outlineOffset = '-3px';
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  function clearHighlight() {
    document.querySelectorAll('[data-editable]').forEach(function(s) {
      s.style.outline = '';
      s.style.outlineOffset = '';
    });
  }

  // 로드 완료 알림
  window.parent.postMessage({ type: 'READY' }, location.origin);
})();
</script>
`

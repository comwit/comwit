import Link from 'next/link'
import { Copy } from '@/i18n/copy'
import './template-picker.css'

// Schematic illustrations identify the starting points, not bundled customer screens.
function BasicPreview() {
  return (
    <svg viewBox="0 0 320 160" fill="none" aria-hidden="true" focusable="false">
      <rect x="37" y="16" width="222" height="131" rx="8" fill="#f7f1dc" />
      <path d="M37 42h222" stroke="#a5b5a0" />
      <path d="M51 29h3m7 0h3m7 0h3" stroke="#0e5a43" strokeWidth="4" strokeLinecap="round" />
      <rect x="49" y="55" width="38" height="79" rx="3" fill="#d9e2cf" />
      <path
        d="M59 67h18m-18 12h12m-12 12h15"
        stroke="#658373"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <rect x="99" y="55" width="146" height="32" rx="3" fill="#c0d2b9" />
      <path d="M110 67h64m-64 10h39" stroke="#0e5a43" strokeWidth="4" strokeLinecap="round" />
      <rect x="99" y="98" width="67" height="36" rx="3" stroke="#739785" strokeDasharray="4 4" />
      <rect x="178" y="98" width="67" height="36" rx="3" stroke="#739785" strokeDasharray="4 4" />
      <rect
        x="239"
        y="62"
        width="50"
        height="88"
        rx="8"
        fill="#f7f1dc"
        stroke="#0e5a43"
        strokeWidth="3"
      />
      <path d="M257 71h14m-17 68h20" stroke="#0e5a43" strokeWidth="3" strokeLinecap="round" />
      <rect x="247" y="81" width="34" height="23" rx="2" fill="#c0d2b9" />
      <rect x="247" y="111" width="34" height="19" rx="2" stroke="#739785" strokeDasharray="3 3" />
    </svg>
  )
}

function ShopPreview() {
  return (
    <svg viewBox="0 0 320 160" fill="none" aria-hidden="true" focusable="false">
      <rect
        x="51"
        y="38"
        width="218"
        height="109"
        rx="5"
        fill="#fff9e9"
        stroke="#a9673d"
        strokeWidth="2"
      />
      <path d="M59 17h202l14 31H45l14-31Z" fill="#b66a3c" />
      <path
        d="m83 17-7 31h30l3-31h-26Zm52 0-1 31h27V17h-26Zm52 0 3 31h29l-6-31h-26Zm52 0 9 31h27l-14-31h-22Z"
        fill="#f1d6a5"
      />
      <path
        d="M45 48v6c0 15 31 15 31 0 0 15 30 15 30 0 0 15 28 15 28 0 0 15 27 15 27 0 0 15 29 15 29 0 0 15 29 15 29 0 0 15 29 15 29 0 0 15 27 15 27 0v-6"
        fill="#b66a3c"
      />
      <rect x="67" y="79" width="53" height="44" rx="3" fill="#efe1c5" />
      <path d="M83 95h21l4 22H79l4-22Z" fill="#a9673d" />
      <path d="M88 96v-5a6 6 0 0 1 12 0v5" stroke="#a9673d" strokeWidth="2" />
      <rect x="133" y="79" width="53" height="44" rx="3" fill="#e1e5ca" />
      <path d="m146 97 14-7 14 7v18h-28V97Z" fill="#6d8152" />
      <path d="m146 97 14 7 14-7m-14 7v11" stroke="#e1e5ca" strokeWidth="2" />
      <rect x="199" y="79" width="53" height="44" rx="3" fill="#f1d6a5" />
      <path d="M219 90h13v7l5 8v12h-23v-12l5-8v-7Z" fill="#b66a3c" />
      <path d="M81 134h25m41 0h25m41 0h25" stroke="#a9673d" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function LinkArrow() {
  return (
    <span className="tp-template-card-arrow" aria-hidden="true">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" focusable="false">
        <path
          d="M5 12h14m-6-6 6 6-6 6"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

export function TemplatePicker() {
  return (
    <div className="tp-template-picker">
      <Link
        href="/template/docs/getting-started"
        className="tp-template-card"
        aria-labelledby="template-basic-title"
      >
        <div className="tp-template-card-preview" aria-hidden="true">
          <BasicPreview />
        </div>
        <div className="tp-template-card-label">
          <div>
            <strong id="template-basic-title">
              <Copy id="templateBase" />
            </strong>
            <span>
              <Copy id="templateBaseFoundation" />
            </span>
          </div>
          <LinkArrow />
        </div>
      </Link>
      <Link
        href="/template/docs/shop/overview"
        className="tp-template-card tp-template-card-shop"
        aria-labelledby="template-shop-title"
      >
        <div className="tp-template-card-preview" aria-hidden="true">
          <ShopPreview />
        </div>
        <div className="tp-template-card-label">
          <div>
            <strong id="template-shop-title">Shop Template</strong>
            <span>
              <Copy id="templateShopFoundation" />
            </span>
          </div>
          <LinkArrow />
        </div>
      </Link>
    </div>
  )
}

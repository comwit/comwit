'use client'
import Image from 'next/image'
import { Button } from '@comwit/ui-templates/button'
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@comwit/ui-templates/dialog'
import { useState } from 'react'
import { useLocale } from 'next-intl'
import reference from '@/lib/shop-reference.json'

const types: Record<string, [string, string]> = {
  fashion: ['패션', 'Fashion'],
  food: ['푸드·음료', 'Food & drink'],
  pets: ['반려동물', 'Pets'],
  accessories: ['주얼리·잡화', 'Jewelry & accessories'],
  living: ['리빙·공예', 'Living & craft'],
  beauty: ['뷰티·향', 'Beauty & fragrance'],
}
// Editorial order belongs to docs, leaving the shared skill catalog unchanged.
const firstBrands = ['yunseul', 'greenrow', 'mongdol-soap', 'hangyeol-leather']
const orderedBrands = [...reference.catalog.brands].sort((a, b) => {
  const rank = (id: string) =>
    id === 'ore-atelier'
      ? Number.MAX_SAFE_INTEGER
      : firstBrands.includes(id)
        ? firstBrands.indexOf(id)
        : firstBrands.length
  return rank(a.id) - rank(b.id)
})
// Names follow the example sites' titles, wordmarks and copyright text.
// Pogeunpet and Heukgyeol are romanizations where the site uses Korean only.
const brandNames: Record<string, [string, string]> = {
  aurelle: ['오렐', 'AURELLE'],
  greenrow: ['그린로우', 'greenrow'],
  pogeunpet: ['포근펫', 'Pogeunpet'],
  'ore-atelier': ['오르 아틀리에', 'Or Atelier'],
  yunseul: ['윤슬', 'YUNSEUL'],
  heukgyeol: ['흙결', 'Heukgyeol'],
  'maison-ruelle': ['메종 루엘', 'Maison Ruelle'],
  supgyeol: ['숲결', 'SOOPGYEOL'],
  bukhyang: ['북향', 'BUKHYANG'],
  'mongdol-soap': ['몽돌솝', 'mongdolsoap'],
  'hangyeol-leather': ['한결 레더', 'HANGYEOL'],
}
const industries: Record<string, string> = {
  '여성 패션': "Women's fashion",
  '남성 패션': "Men's fashion",
  '푸드 · 음료': 'Food & drink',
  반려동물: 'Pet supplies',
  주얼리: 'Jewelry',
  아이웨어: 'Eyewear',
  '도자기 · 리빙': 'Ceramics & living',
  '향수 · 프래그런스': 'Fragrance',
  '뷰티 · 라이프스타일': 'Beauty & lifestyle',
  '가죽 · 잡화': 'Leather goods',
}
type Brand = (typeof orderedBrands)[number]
function BrandPreview({ brand, ko }: { brand: Brand; ko: boolean }) {
  const displayName = brandNames[brand.id]?.[ko ? 0 : 1] ?? brand.name
  const industry = ko ? brand.category : (industries[brand.category] ?? brand.typeLabelEn)
  const [screenIndex, setScreenIndex] = useState(0)
  const screen = brand.screens[screenIndex]
  return (
    <article className="shop-reference-card">
      <Dialog
        onOpenChange={(open) => {
          if (open) setScreenIndex(0)
        }}
      >
        <DialogTrigger asChild>
          <Button
            variant="plain"
            size="none"
            type="button"
            className="shop-image-trigger"
            aria-label={ko ? `${displayName} 화면 보기` : `View ${displayName} screens`}
          >
            <Image
              unoptimized
              src={`/template/shop/${brand.screens[0].file}`}
              width={720}
              height={480}
              alt={`${displayName} — ${ko ? '홈 화면' : 'homepage'}`}
              loading="lazy"
            />
            <span className="shop-image-hint" aria-hidden="true">
              ↗
            </span>
          </Button>
        </DialogTrigger>
        <DialogContent className="shop-image-dialog" closeLabel={ko ? '닫기' : 'Close'}>
          <div className="shop-image-dialog-heading">
            <DialogTitle>{displayName}</DialogTitle>
            <DialogDescription>{industry}</DialogDescription>
          </div>
          <Image
            unoptimized
            src={`/template/shop/${screen.file}`}
            width={720}
            height={480}
            alt={`${displayName} — ${screenIndex === 0 ? (ko ? '홈 화면' : 'homepage') : ko ? '상품 상세 화면' : 'product detail'}`}
          />
          <div className="shop-image-tools">
            <div>
              {brand.screens.map((item, index) => (
                <Button
                  variant="plain"
                  size="none"
                  key={item.kind}
                  type="button"
                  aria-pressed={screenIndex === index}
                  onClick={() => setScreenIndex(index)}
                >
                  {index === 0 ? (ko ? '홈' : 'Home') : ko ? '상세' : 'Detail'}
                </Button>
              ))}
            </div>
            <a
              href={screenIndex === 0 ? brand.url : brand.url + brand.productPath}
              target="_blank"
              rel="noreferrer"
            >
              {ko ? '사이트' : 'Visit site'} ↗
            </a>
          </div>
        </DialogContent>
      </Dialog>
      <div className="shop-reference-caption">
        <span>{displayName}</span>
        <small>{industry}</small>
      </div>
    </article>
  )
}
export function ShopGallery() {
  const ko = useLocale() === 'ko'
  const [filter, setFilter] = useState('all')
  const brands = orderedBrands.filter((b) => filter === 'all' || b.type === filter)
  return (
    <section
      className="shop-gallery not-prose"
      aria-label={ko ? '실제 쇼핑몰 예시' : 'Actual storefront examples'}
    >
      <div className="shop-filters" aria-label={ko ? '브랜드 타입' : 'Brand type'}>
        {['all', ...Object.keys(types)].map((type) => (
          <Button
            variant="plain"
            size="none"
            key={type}
            type="button"
            aria-pressed={filter === type}
            onClick={() => setFilter(type)}
          >
            {type === 'all' ? (ko ? '전체' : 'All') : types[type][ko ? 0 : 1]}
          </Button>
        ))}
      </div>
      <div className="shop-gallery-grid">
        {brands.map((brand) => (
          <BrandPreview key={brand.id} brand={brand} ko={ko} />
        ))}
      </div>
      <p className="shop-reference-note">
        <a href={reference.catalog.source} target="_blank" rel="noreferrer">
          Shop Studio ↗
        </a>{' '}
        · {ko ? '실제 화면' : 'Actual screens'} · 2026-10-15 ·{' '}
        <a href="/template/shop/catalog.json">{ko ? '출처' : 'Sources'}</a>
      </p>
    </section>
  )
}
export function ShopRoutes() {
  const ko = useLocale() === 'ko'
  return (
    <div className="shop-routes">
      {['app', 'admin'].map((service) => (
        <section key={service}>
          <h3>
            {service === 'admin'
              ? ko
                ? '관리자 화면'
                : 'Admin screens'
              : ko
                ? '스토어 화면'
                : 'Storefront pages'}
          </h3>
          <div className="shop-table-scroll">
            <table>
              <thead>
                <tr>
                  <th>
                    {service === 'admin'
                      ? ko
                        ? '경로 예시'
                        : 'Example route'
                      : ko
                        ? '페이지 경로'
                        : 'Page route'}
                  </th>
                  <th>{ko ? '실제 라우터 파일' : 'Router source'}</th>
                </tr>
              </thead>
              <tbody>
                {reference.routes
                  .filter((r) =>
                    service === 'admin' ? r.path.startsWith('/admin') : !r.path.startsWith('/admin')
                  )
                  .map((r) => (
                    <tr key={r.file}>
                      <td>
                        <code>
                          {service === 'admin'
                            ? r.path.replace(/^\/admin/, '/관리자-a1b2c3d4e5')
                            : r.path}
                        </code>
                        {r.intercepted && <small> {ko ? '인터셉트' : 'intercepted'}</small>}
                      </td>
                      <td>
                        <a
                          href={`https://github.com/comwit/template-shop/blob/main/${r.file}`}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <code>{r.file}</code>
                        </a>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}
export function ShopAdminScreens() {
  const ko = useLocale() === 'ko'
  return (
    <div className="shop-admin-grid not-prose">
      {reference.admin.map(
        (screen: {
          file: string
          title: string
          titleKo: string
          story: string
          source: string
        }) => (
          <figure key={screen.file}>
            <a href={`/template/shop/${screen.file}`} target="_blank" rel="noreferrer">
              <Image
                unoptimized
                src={`/template/shop/${screen.file}`}
                alt={ko ? screen.titleKo : screen.title}
                width={1164}
                height={655}
                loading="lazy"
              />
            </a>
            <figcaption>
              {ko ? screen.titleKo : screen.title} <small>{'Storybook'}</small>
            </figcaption>
          </figure>
        )
      )}
    </div>
  )
}

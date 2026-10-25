'use client'
import Image from 'next/image'
import { Button } from '@comwit/ui-templates/button'
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
export function ShopGallery() {
  const ko = useLocale() === 'ko'
  const [filter, setFilter] = useState('all')
  const brands = reference.catalog.brands.filter((b) => filter === 'all' || b.type === filter)
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
          <article className="shop-reference-card" key={brand.id}>
            <a href={brand.url} target="_blank" rel="noreferrer">
              <Image
                unoptimized
                src={`/template/shop/${brand.screens[0].file}`}
                width={720}
                height={480}
                alt={`${brand.name} — ${ko ? '실제 홈 화면' : 'actual homepage'}`}
                loading="lazy"
              />
            </a>
            <div className="shop-reference-caption">
              <strong>{brand.name}</strong>
              <span>{ko ? brand.category : brand.typeLabelEn}</span>
            </div>
            <details>
              <summary>{ko ? '상품 상세 화면' : 'Product detail screen'}</summary>
              <a href={brand.url + brand.productPath} target="_blank" rel="noreferrer">
                <Image
                  unoptimized
                  src={`/template/shop/${brand.screens[1].file}`}
                  width={720}
                  height={480}
                  alt={`${brand.name} — ${ko ? '실제 상품 상세' : 'actual product detail'}`}
                  loading="lazy"
                />
              </a>
            </details>
          </article>
        ))}
      </div>
      <p className="shop-reference-note">
        {ko
          ? '2026-10-15 공개 사이트 캡처. 운영 실적이나 고객 데이터가 아닌 디자인 사례입니다.'
          : 'Public-site screenshots captured on 2026-10-15; design examples, not customer data or commercial results.'}{' '}
        <a href={reference.catalog.source} target="_blank" rel="noreferrer">
          Shop Studio ↗
        </a>{' '}
        · <a href="/template/shop/catalog.json">{ko ? '출처 목록' : 'Source catalog'}</a>
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
                  <th>{ko ? '페이지 경로' : 'Page route'}</th>
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
                          {service === 'admin' ? r.path.replace(/^\/admin/, '/관리자') : r.path}
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
                loading="lazy"
              />
            </a>
            <figcaption>
              {ko ? screen.titleKo : screen.title}{' '}
              <small>
                {ko ? '실제 페이지 · Storybook 목 데이터' : 'Real page · Storybook mock data'}
              </small>
            </figcaption>
          </figure>
        )
      )}
    </div>
  )
}

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
import reference from '@/lib/course-reference.json'
import captures from '@/assets/course-gallery/captures.json'
import { courseRows } from '@/lib/course-diagram.mjs'
import { AdminScreens, SourceLink, TemplateRoutes } from './shop-reference'
import { SchemaDiagram } from './shop-schema'

// Names follow the example sites' titles; English names translate the Korean wordmarks.
const brands: Record<string, { name: [string, string]; topic: [string, string] }> = {
  moneyroutine: {
    name: ['머니루틴', 'Money Routine'],
    topic: ['부업·재테크', 'Side income & investing'],
  },
  momentumlab: {
    name: ['모멘텀랩', 'Momentum Lab'],
    topic: ['AI·마케팅 지식 창업', 'AI & marketing business'],
  },
  scaleclass: {
    name: ['스케일클래스', 'SCALECLASS'],
    topic: ['크리에이터 수익화', 'Creator monetization'],
  },
  jisikgotgan: {
    name: ['지식곳간', 'Jisikgotgan'],
    topic: ['지식 판매·재테크', 'Knowledge sales & finance'],
  },
  sidenote: {
    name: ['사이드노트', 'Side Note'],
    topic: ['블로그·디지털 상품', 'Blogging & digital products'],
  },
}
const kinds: Record<string, [string, string]> = {
  home: ['홈', 'Home'],
  courses: ['강의 목록', 'Courses'],
  detail: ['강의 상세', 'Course detail'],
}
type Brand = (typeof captures.brands)[number]
function BrandPreview({ brand, ko }: { brand: Brand; ko: boolean }) {
  const meta = brands[brand.id]
  const displayName = meta?.name[ko ? 0 : 1] ?? brand.name
  const topic = meta?.topic[ko ? 0 : 1]
  const home = brand.screens.find((item) => item.kind === 'home' && item.device === 'desktop')!
  const mobile = brand.screens.find((item) => item.kind === 'home' && item.device === 'mobile')!
  const screens = brand.screens.map((item) => ({
    ...item,
    label: `${kinds[item.kind][ko ? 0 : 1]} · ${item.device === 'desktop' ? 'PC' : ko ? '모바일' : 'Mobile'}`,
  }))
  const [screenIndex, setScreenIndex] = useState(0)
  const screen = screens[screenIndex]
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
              className="shop-preview-desktop"
              unoptimized
              src={`/template/course/${home.file}`}
              width={home.viewport.width}
              height={home.viewport.height}
              alt={`${displayName} — ${ko ? 'PC 홈 화면' : 'desktop homepage'}`}
              loading="lazy"
            />
            <Image
              className="shop-preview-mobile"
              unoptimized
              src={`/template/course/${mobile.file}`}
              width={mobile.viewport.width}
              height={mobile.viewport.height}
              alt={`${displayName} — ${ko ? '모바일 홈 화면' : 'mobile homepage'}`}
              loading="lazy"
            />
          </Button>
        </DialogTrigger>
        <DialogContent className="shop-image-dialog" closeLabel={ko ? '닫기' : 'Close'}>
          <div className="shop-image-dialog-heading">
            <DialogTitle>{displayName}</DialogTitle>
            <DialogDescription>{topic}</DialogDescription>
          </div>
          <div className="shop-image-viewer" aria-live="polite" aria-atomic="true">
            <Image
              unoptimized
              src={`/template/course/${screen.file}`}
              width={screen.viewport.width}
              height={screen.viewport.height}
              alt={`${displayName} — ${screen.label}`}
            />
            <span className="sr-only">{screen.label}</span>
          </div>
          <div className="shop-image-tools">
            <div role="group" aria-label={ko ? '화면 선택' : 'Choose a screen'}>
              {screens.map((item, index) => (
                <Button
                  variant="plain"
                  size="none"
                  key={item.file}
                  type="button"
                  aria-pressed={screenIndex === index}
                  onClick={() => setScreenIndex(index)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
            <a
              href={screen.url}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={
                ko ? `${displayName} 사이트 보기 (새 탭)` : `Visit ${displayName} (new tab)`
              }
            >
              {ko ? '사이트 보기' : 'Visit site'} <span aria-hidden="true">↗</span>
            </a>
          </div>
        </DialogContent>
      </Dialog>
      <div className="shop-reference-caption">
        <span>{displayName}</span>
        <small>{topic}</small>
      </div>
    </article>
  )
}
export function CourseGallery() {
  const ko = useLocale() === 'ko'
  return (
    <section
      className="shop-gallery not-prose"
      aria-label={ko ? '실제 강의 플랫폼 예시' : 'Actual course platform examples'}
    >
      <div className="shop-gallery-grid">
        {captures.brands.map((brand) => (
          <BrandPreview key={brand.id} brand={brand} ko={ko} />
        ))}
      </div>
      <p className="shop-reference-note">
        {ko ? '실제 화면' : 'Actual screens'} ·{' '}
        <a href="/template/course/gallery.json">{ko ? '캡처 출처' : 'Capture sources'}</a>
      </p>
    </section>
  )
}
export function CourseRoutes() {
  return (
    <TemplateRoutes
      routes={reference.routes}
      sourceCommit={reference.sourceCommit}
      appLabel={['수강생 화면', 'Learner pages']}
    />
  )
}
export function CourseSchema() {
  return <SchemaDiagram source={reference.tables} rows={courseRows} />
}
export function CourseAdminScreens() {
  return <AdminScreens screens={reference.admin} dir="course" />
}
export function CourseSourceLink({ path, children }: { path: string; children: React.ReactNode }) {
  return (
    <SourceLink commit={reference.sourceCommit} path={path}>
      {children}
    </SourceLink>
  )
}

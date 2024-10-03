import { useRouter } from "next/router"
import { useTranslation } from "next-i18next"

import { TranslationKey } from "@/lib/types"
import type { DeveloperDocsLink } from "@/lib/interfaces"

import Emoji from "@/components/Emoji"

import { cn } from "@/lib/utils/cn"

import docLinks from "@/data/developer-docs-links.yaml"

import { Flex, Stack } from "./ui/flex"
import { BaseLink } from "./ui/Link"

import { useRtlFlip } from "@/hooks/useRtlFlip"

const TextDiv = ({ children, className, ...props }) => (
  <Stack
    className={cn(
      "h-full max-w-[166px] justify-between gap-0 break-words p-4",
      className
    )}
    {...props}
  >
    {children}
  </Stack>
)

type DocsArrayProps = {
  href: string
  id: TranslationKey
}

type CardLinkProps = {
  docData: DocsArrayProps
  contentNotTranslated: boolean
  isPrev?: boolean
}

const CardLink = ({ docData, isPrev, contentNotTranslated }: CardLinkProps) => {
  const { t } = useTranslation("page-developers-docs")
  const { isRtl } = useRtlFlip()

  const xPaddingClass = isPrev ? "ps-0" : "pe-0"

  return (
    <BaseLink
      href={docData.href}
      className={cn(
        "flex w-full flex-1 items-center no-underline",
        "h-[82px] rounded-[1px] border bg-background",
        isPrev ? "justify-start" : "justify-end"
      )}
      rel={isPrev ? "prev" : "next"}
      customEventOptions={{
        eventCategory: "next/previous article DocsNav",
        eventAction: "click",
        eventName: isPrev ? "previous" : "next",
      }}
    >
      <div className={cn("h-full p-4", isPrev ? "order-[0]" : "order-1")}>
        <Emoji
          text={isPrev ? ":point_left:" : ":point_right:"}
          className={cn(
            "text-5xl",
            !contentNotTranslated && isRtl ? "-scale-x-100" : ""
          )}
        />
      </div>
      <TextDiv className={cn(xPaddingClass, !isPrev ? "text-end" : "")}>
        <p className="uppercase text-body">{t(isPrev ? "previous" : "next")}</p>

        <p className={cn("underline", isPrev ? "text-start" : "text-end")}>
          {t(docData.id)}
        </p>
      </TextDiv>
    </BaseLink>
  )
}

type DocsNavProps = {
  contentNotTranslated: boolean
}

const DocsNav = ({ contentNotTranslated }: DocsNavProps) => {
  const { asPath } = useRouter()
  // Construct array of all linkable documents in order recursively
  const docsArray: DocsArrayProps[] = []
  const getDocs = (links: Array<DeveloperDocsLink>): void => {
    for (const item of links) {
      // If object has 'items' key
      if (item.items) {
        // And if item has a 'to' key
        // Add 'to' path and 'id' to docsArray
        item.href && docsArray.push({ href: item.href, id: item.id })
        // Then recursively add sub-items
        getDocs(item.items)
      } else {
        // If object has no further 'items', add and continue
        docsArray.push({ href: item.href, id: item.id })
      }
    }
  }

  // Initiate recursive loop with full docLinks yaml
  getDocs(docLinks)

  // Find index that matches current page
  let currentIndex = 0
  for (let i = 0; i < docsArray.length; i++) {
    if (
      asPath.indexOf(docsArray[i].href) >= 0 &&
      asPath.length === docsArray[i].href.length
    ) {
      currentIndex = i
    }
  }

  // Extract previous and next doc based on current index +/- 1
  const previousDoc = currentIndex - 1 >= 0 ? docsArray[currentIndex - 1] : null
  const nextDoc =
    currentIndex + 1 < docsArray.length ? docsArray[currentIndex + 1] : null

  return (
    <Flex
      className={cn(
        "flex-col-reverse md:flex-row lg:flex-col-reverse xl:flex-row",
        "mt-8 justify-between gap-4",
        "items-center md:items-start"
      )}
      aria-label="Paginate to document"
    >
      {previousDoc ? (
        <CardLink
          docData={previousDoc}
          contentNotTranslated={contentNotTranslated}
          isPrev
        />
      ) : (
        <div className="hidden flex-grow xl:block"></div>
      )}
      {nextDoc ? (
        <CardLink
          docData={nextDoc}
          contentNotTranslated={contentNotTranslated}
        />
      ) : (
        <div className="hidden flex-grow xl:block"></div>
      )}
    </Flex>
  )
}

export default DocsNav

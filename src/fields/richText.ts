import {
  FixedToolbarFeature,
  HeadingFeature,
  LinkFeature,
  UploadFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

const replaced = new Set(['heading', 'link', 'upload', 'relationship'])

export const editor = lexicalEditor({
  features: ({ defaultFeatures }) => [
    ...defaultFeatures.filter((feature) => !replaced.has(feature.key)),
    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
    LinkFeature({ enabledCollections: ['news', 'events', 'promises', 'reports', 'ideas'] }),
    UploadFeature({ enabledCollections: ['media'] }),
    FixedToolbarFeature(),
  ],
})

import React from 'react'

// Reusable style objects
const COMMON_STYLES = {
  richTextContainer: {
    outline: 'none',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    flexShrink: 0,
    transform: 'none'
  } as React.CSSProperties,
  
  badgeRichText: {
    outline: 'none',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    flexShrink: 0,
    '--extracted-r6o4lv': 'var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38))',
    '--framer-link-text-color': 'rgb(0, 153, 255)',
    '--framer-link-text-decoration': 'underline',
    transform: 'none',
    opacity: 1
  } as React.CSSProperties,
  
  buttonRichText: {
    outline: 'none',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    flexShrink: 0,
    '--extracted-r6o4lv': 'var(--token-44021ae2-4cdd-419c-805c-4b1fd642bfaa, rgb(255, 255, 255))',
    '--framer-link-text-color': 'rgb(0, 153, 255)',
    '--framer-link-text-decoration': 'underline',
    transform: 'none',
    opacity: 1
  } as React.CSSProperties
}

// Form field configuration
interface FormField {
  label: string
  name: string
  placeholder: string
  type: 'text' | 'textarea'
  required: boolean
  labelClassName: string
  labelContainerClassName: string
  inputWrapperClassName: string
}

const FORM_FIELDS: FormField[] = [
  {
    label: 'First Name *',
    name: 'First Name',
    placeholder: 'Jane',
    type: 'text',
    required: true,
    labelClassName: 'framer-od4cgz',
    labelContainerClassName: 'framer-151jb9',
    inputWrapperClassName: 'framer-10yziul'
  },
  {
    label: 'Last Name *',
    name: 'Last Name',
    placeholder: 'Smith',
    type: 'text',
    required: true,
    labelClassName: 'framer-pb6l2z',
    labelContainerClassName: 'framer-n4mf03',
    inputWrapperClassName: 'framer-11k029n'
  },
  {
    label: 'Email *',
    name: 'Email *',
    placeholder: 'jane@framer.com',
    type: 'text',
    required: true,
    labelClassName: 'framer-1r49r81',
    labelContainerClassName: 'framer-1xqtu8d',
    inputWrapperClassName: 'framer-bbu85v'
  },
  {
    label: 'Message',
    name: 'Message',
    placeholder: 'Write your message here',
    type: 'textarea',
    required: true,
    labelClassName: 'framer-1ib9i91',
    labelContainerClassName: 'framer-1p5iwjq',
    inputWrapperClassName: 'framer-k9wiri'
  }
]

// Reusable components
const RichTextHeading: React.FC<{ children: React.ReactNode; className?: string; style?: React.CSSProperties }> = ({ 
  children, 
  className = 'framer-styles-preset-wct5n4',
  style 
}) => (
  <h6 
    className={`framer-text ${className}`}
    data-styles-preset="OvgFe4dMx"
    style={style}
  >
    {children}
  </h6>
)

const FormField: React.FC<{ field: FormField }> = ({ field }) => {
  const { label, name, placeholder, type, required, labelClassName, labelContainerClassName, inputWrapperClassName } = field
  
  return (
    <label className={labelClassName}>
      <div 
        className={labelContainerClassName}
        data-framer-component-type="RichTextContainer"
        style={COMMON_STYLES.richTextContainer}
      >
        <RichTextHeading>{label}</RichTextHeading>
      </div>
      <div className={`framer-form-text-input framer-form-input-wrapper ${inputWrapperClassName}`}>
        {type === 'text' ? (
          <input
            data-1p-ignore="true"
            data-lpignore="true"
            data-form-type="other"
            type="text"
            required={required}
            name={name}
            placeholder={placeholder}
            className="framer-form-input framer-form-input-empty"
            defaultValue=""
          />
        ) : (
          <textarea
            data-1p-ignore="true"
            data-lpignore="true"
            data-form-type="other"
            required={required}
            name={name}
            placeholder={placeholder}
            className="framer-form-input"
          />
        )}
      </div>
    </label>
  )
}

const ContactPage = () => {
  return (
    <section className="framer-2jydna" data-framer-name="Hero Section" id="hero">
      <div 
        className="framer-mimb9t"
        data-framer-appear-id="mimb9t"
        data-framer-name="Container"
        style={{ opacity: 1, transform: 'none', willChange: 'transform' }}
      >
        <div className="framer-xfl5fh" data-framer-name="Heading &amp; Supporting Text">
          <div className="framer-1sdkud6" data-framer-name="Heading Container">
            <div className="framer-u3qv6s-container">
              <div
                className="framer-Fhx2V framer-YF6mi framer-18xhfg8 framer-v-18xhfg8"
                data-border="true"
                data-framer-name="Badge"
                style={{
                  '--border-bottom-width': '1px',
                  '--border-color': 'var(--token-64e377a5-0d6a-419d-892d-eb08deb7230b, rgb(229, 229, 232))',
                  '--border-left-width': '1px',
                  '--border-right-width': '1px',
                  '--border-style': 'solid',
                  '--border-top-width': '1px',
                  backgroundColor: 'var(--token-03d81d49-441b-4a27-ac27-adbec865c0a8, rgb(250, 250, 250))',
                  borderRadius: '17px',
                  boxShadow: '0px 2px 5px 0px var(--token-01b0806d-1c81-4041-802e-d5d50172987c, rgb(240, 241, 242))',
                  opacity: 1
                } as React.CSSProperties}
              >
                <div className="framer-1l1ajhh" data-framer-name="Icon" style={{ opacity: 1 }}>
                  <svg
                    className="framer-XkeER framer-qgvfsn"
                    role="presentation"
                    viewBox="0 0 24 24"
                    style={{
                      '--1m6trwb': '0',
                      '--21h8s6': 'var(--token-53318a49-e2d8-4d3b-98d7-8563add13d3d, rgb(56, 56, 61))',
                      '--pgex8v': '1.4',
                      opacity: 1
                    } as React.CSSProperties}
                  >
                    <use href="#777087443"></use>
                  </svg>
                </div>
                <div
                  className="framer-1710qob"
                  data-framer-component-type="RichTextContainer"
                  style={COMMON_STYLES.badgeRichText}
                >
                  <p
                    className="framer-text framer-styles-preset-kmaoy8"
                    data-styles-preset="MV92va9oP"
                    style={{
                      '--framer-text-color': 'var(--extracted-r6o4lv, var(--token-d3c732bc-55cf-476f-8dd2-e130b23f6381, rgb(38, 38, 38)))'
                    } as React.CSSProperties}
                  >
                    Contact Us
                  </p>
                </div>
              </div>
            </div>
            <div className="framer-4xdrs0" data-framer-name="Heading Content">
              <div className="framer-1yrpysi" data-framer-name="Container">
                <div
                  className="framer-1tsw7p6"
                  data-framer-name="Heading"
                  data-framer-component-type="RichTextContainer"
                  style={COMMON_STYLES.richTextContainer}
                >
                  <h2
                    className="framer-text framer-styles-preset-199apa9"
                    data-styles-preset="Ty6zNsrjE"
                    style={{ '--framer-text-alignment': 'center' } as React.CSSProperties}
                  >
                    We'd Love to Hear from You and Connect
                  </h2>
                </div>
                <div
                  className="framer-1tl2748"
                  data-framer-name="Supporting Text"
                  data-framer-component-type="RichTextContainer"
                  style={COMMON_STYLES.richTextContainer}
                >
                  <p
                    className="framer-text framer-styles-preset-wct5n4"
                    data-styles-preset="OvgFe4dMx"
                    style={{ '--framer-text-alignment': 'center' } as React.CSSProperties}
                  >
                    We're here to help with any questions about our product, pricing, or partnership opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <form className="framer-1e9er38" data-border="true">
          <div className="framer-1nejg1j" data-framer-name="Content">
            <FormField field={FORM_FIELDS[0]} />
            <FormField field={FORM_FIELDS[1]} />
          </div>
          <FormField field={FORM_FIELDS[2]} />
          <FormField field={FORM_FIELDS[3]} />
          <div className="framer-dy8cjj-container">
            <button
              type="submit"
              className="framer-Q61OQ framer-YF6mi framer-11bryb1 framer-v-11bryb1"
              data-framer-name="Default"
              data-reset="button"
              tabIndex={0}
              style={{
                backgroundColor: 'var(--token-4fb69519-fab9-4e89-9296-e6d87759a143, rgb(10, 141, 255))',
                height: '100%',
                width: '100%',
                borderRadius: '10px',
                boxShadow: 'rgba(0, 0, 0, 0.1) 0px 1px 3px 0px',
                opacity: 1
              }}
            >
              <div
                className="framer-17dl7q9"
                data-framer-component-type="RichTextContainer"
                style={COMMON_STYLES.buttonRichText}
              >
                <p
                  className="framer-text framer-styles-preset-kmaoy8"
                  data-styles-preset="MV92va9oP"
                  style={{
                    '--framer-text-color': 'var(--extracted-r6o4lv, var(--token-44021ae2-4cdd-419c-805c-4b1fd642bfaa, rgb(255, 255, 255)))'
                  } as React.CSSProperties}
                >
                  Send Message
                </p>
              </div>
            </button>
          </div>
        </form>
      </div>
    </section>
  )
}

export default ContactPage

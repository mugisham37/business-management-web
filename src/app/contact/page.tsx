import React from 'react'
import { Badge } from '@/components/reui/badge'
import { Button } from '@/components/reui/button'
import { Card, CardContent, CardFooter } from '@/components/reui/card'
import { Field, FieldLabel } from '@/components/reui/field'
import { Input } from '@/components/reui/input'
import { Textarea } from '@/components/reui/textarea'

// Form field configuration
interface FormFieldConfig {
  label: string
  name: string
  placeholder: string
  type: 'text' | 'textarea'
  required: boolean
}

const FORM_FIELDS: FormFieldConfig[] = [
  {
    label: 'First Name *',
    name: 'First Name',
    placeholder: 'Jane',
    type: 'text',
    required: true
  },
  {
    label: 'Last Name *',
    name: 'Last Name',
    placeholder: 'Smith',
    type: 'text',
    required: true
  },
  {
    label: 'Email *',
    name: 'Email *',
    placeholder: 'jane@framer.com',
    type: 'text',
    required: true
  },
  {
    label: 'Message',
    name: 'Message',
    placeholder: 'Write your message here',
    type: 'textarea',
    required: true
  }
]

// Reusable components
const RichTextHeading: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children, 
  className = ''
}) => (
  <h6 className={`text-base font-normal leading-[1.4em] tracking-normal text-[#38383d] ${className}`}>
    {children}
  </h6>
)

const FormField: React.FC<{ field: FormFieldConfig }> = ({ field }) => {
  const { label, name, placeholder, type, required } = field
  
  return (
    <Field className="gap-2">
      <FieldLabel htmlFor={name}>
        <RichTextHeading>{label}</RichTextHeading>
      </FieldLabel>
      <div className="w-full">
        {type === 'text' ? (
          <Input
            id={name}
            data-1p-ignore="true"
            data-lpignore="true"
            data-form-type="other"
            type="text"
            required={required}
            name={name}
            placeholder={placeholder}
            className="w-full px-4 py-3 border border-[rgb(229,229,232)] rounded-lg bg-white text-base font-normal text-[#38383d] placeholder:text-[#91919191] focus:outline-none focus:ring-2 focus:ring-[rgb(10,141,255)] focus:border-transparent transition-all"
            defaultValue=""
          />
        ) : (
          <Textarea
            id={name}
            data-1p-ignore="true"
            data-lpignore="true"
            data-form-type="other"
            required={required}
            name={name}
            placeholder={placeholder}
            rows={5}
            className="w-full px-4 py-3 border border-[rgb(229,229,232)] rounded-lg bg-white text-base font-normal text-[#38383d] placeholder:text-[#91919191] focus:outline-none focus:ring-2 focus:ring-[rgb(10,141,255)] focus:border-transparent transition-all resize-none"
          />
        )}
      </div>
    </Field>
  )
}

const ContactPage = () => {
  return (
    <section className="w-full py-20 px-4" id="hero">
      <div className="max-w-4xl mx-auto opacity-100">
        <div className="flex flex-col items-center gap-12 mb-12">
          <div className="flex flex-col items-center gap-8">
            <div className="inline-flex">
              <Badge 
                variant="outline"
                size="lg"
                className="flex items-center gap-2 px-4 py-2 bg-[rgb(250,250,250)] border-[rgb(229,229,232)] rounded-[17px] shadow-[0px_2px_5px_0px_rgb(240,241,242)]"
              >
                <svg
                  className="w-5 h-5"
                  role="presentation"
                  viewBox="0 0 24 24"
                  style={{
                    fill: 'rgb(56,56,61)',
                    opacity: 1
                  }}
                >
                  <use href="#777087443"></use>
                </svg>
                <span className="text-sm font-normal leading-[1.3em] tracking-[-0.01em] text-[#38383d]">
                  Contact Us
                </span>
              </Badge>
            </div>
            <div className="flex flex-col items-center gap-6">
              <div className="flex flex-col items-center">
                <div className="outline-none flex flex-col justify-start shrink-0">
                  <h2 className="text-[50px] lg:text-[38px] sm:text-[28px] font-semibold leading-[1em] tracking-[-0.02em] text-black text-center">
                    We'd Love to Hear from You and Connect
                  </h2>
                </div>
                <div className="outline-none flex flex-col justify-start shrink-0 mt-4">
                  <p className="text-base font-normal leading-[1.4em] tracking-normal text-[#38383d] text-center">
                    We're here to help with any questions about our product, pricing, or partnership opportunities.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <Card className="w-full bg-white rounded-2xl border border-[rgb(229,229,232)] shadow-none">
          <form>
            <CardContent className="flex flex-col gap-6 p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField field={FORM_FIELDS[0]} />
                <FormField field={FORM_FIELDS[1]} />
              </div>
              <FormField field={FORM_FIELDS[2]} />
              <FormField field={FORM_FIELDS[3]} />
            </CardContent>
            <CardFooter className="px-8 pb-8 pt-0">
              <Button
                type="submit"
                className="w-full px-6 py-4 bg-[rgb(10,141,255)] hover:bg-[rgb(8,120,220)] rounded-[10px] shadow-[rgba(0,0,0,0.1)_0px_1px_3px_0px] transition-colors duration-200 h-auto"
              >
                <span className="text-sm font-normal leading-[1.3em] tracking-[-0.01em] text-white">
                  Send Message
                </span>
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </section>
  )
}

export default ContactPage

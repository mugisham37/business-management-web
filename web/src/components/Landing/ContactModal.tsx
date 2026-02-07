"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"
import ContactForm from "./ContactForm"

interface ContactModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function ContactModal({ open, onOpenChange }: ContactModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="max-w-5xl max-h-[90vh] overflow-y-auto"
        showCloseButton={true}
      >
        <DialogHeader className="sr-only">
          <DialogTitle>Contact Us</DialogTitle>
          <DialogDescription>
            Get in touch with our team to discuss your project
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
          <ContactForm />
        </div>
      </DialogContent>
    </Dialog>
  )
}

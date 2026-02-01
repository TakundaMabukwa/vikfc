"use client"

import React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Heart, Printer, Sparkles, Gift, Car, PartyPopper, X } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface SignatureData {
  vik: string | null
  decentCrook: string | null
}

export function LoveContract() {
  const [signatures, setSignatures] = useState<SignatureData>({
    vik: null,
    decentCrook: null,
  })
  const [isDrawing, setIsDrawing] = useState(false)
  const [activeCanvas, setActiveCanvas] = useState<"vik" | "decentCrook" | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [showCelebration, setShowCelebration] = useState(false)
  const [envelopeState, setEnvelopeState] = useState<"closed" | "opening" | "open">("closed")
  const [noButtonPosition, setNoButtonPosition] = useState({ x: 0, y: 0 })
  const [accepted, setAccepted] = useState(false)
  const [signatureModal, setSignatureModal] = useState<"vik" | "decentCrook" | null>(null)
  const vikCanvasRef = useRef<HTMLCanvasElement>(null)
  const crookCanvasRef = useRef<HTMLCanvasElement>(null)
  const modalCanvasRef = useRef<HTMLCanvasElement>(null)
  const contractRef = useRef<HTMLDivElement>(null)
  const noButtonRef = useRef<HTMLButtonElement>(null)
  const supabase = createClient()

  // Load signatures from Supabase on mount
  useEffect(() => {
    const loadSignatures = async () => {
      const { data } = await supabase
        .from('signatures')
        .select('*')
        .eq('id', 'love-contract')
        .single()
      
      if (data) {
        const loadedSignatures = {
          vik: data.vik_signature,
          decentCrook: data.shalom_signature
        }
        setSignatures(loadedSignatures)
        setAccepted(data.valentine_accepted || false)
      }
    }
    loadSignatures()
  }, [])

  // Restore canvas images when signatures change
  useEffect(() => {
    if (signatures.vik && vikCanvasRef.current) {
      const ctx = vikCanvasRef.current.getContext("2d")
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => ctx?.drawImage(img, 0, 0)
      img.src = signatures.vik
    }
    if (signatures.decentCrook && crookCanvasRef.current) {
      const ctx = crookCanvasRef.current.getContext("2d")
      const img = new Image()
      img.crossOrigin = "anonymous"
      img.onload = () => ctx?.drawImage(img, 0, 0)
      img.src = signatures.decentCrook
    }
  }, [signatures, currentPage])

  const getCanvasRef = (type: "vik" | "decentCrook") => {
    return type === "vik" ? vikCanvasRef : crookCanvasRef
  }

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    const canvas = modalCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    setIsDrawing(true)
    
    ctx.strokeStyle = "#8B2942"
    ctx.lineWidth = 3
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
    
    const rect = canvas.getBoundingClientRect()
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top
    
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault()
    if (!isDrawing) return
    const canvas = modalCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    const rect = canvas.getBoundingClientRect()
    const x = "touches" in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left
    const y = "touches" in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top
    
    ctx.lineTo(x, y)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const openSignatureModal = (type: "vik" | "decentCrook") => {
    if (signatures[type]) return
    setSignatureModal(type)
    setTimeout(() => {
      const canvas = modalCanvasRef.current
      if (canvas) {
        const ctx = canvas.getContext("2d")
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
        }
      }
    }, 100)
  }

  const closeSignatureModal = () => {
    setSignatureModal(null)
    setIsDrawing(false)
  }

  const saveSignature = async () => {
    if (!signatureModal) return
    const canvas = modalCanvasRef.current
    if (!canvas) return
    const dataUrl = canvas.toDataURL()
    
    const field = signatureModal === 'vik' ? 'vik_signature' : 'shalom_signature'
    const timestampField = signatureModal === 'vik' ? 'vik_signed_at' : 'shalom_signed_at'
    
    await supabase
      .from('signatures')
      .upsert({
        id: 'love-contract',
        [field]: dataUrl,
        [timestampField]: new Date().toISOString()
      })
    
    const newSignatures = { ...signatures, [signatureModal]: dataUrl }
    setSignatures(newSignatures)
    
    // Copy to display canvas
    const displayCanvas = getCanvasRef(signatureModal).current
    if (displayCanvas) {
      const ctx = displayCanvas.getContext("2d")
      const img = new Image()
      img.onload = () => ctx?.drawImage(img, 0, 0)
      img.src = dataUrl
    }
    
    // Show celebration when Shalom signs
    if (signatureModal === 'decentCrook') {
      setShowCelebration(true)
      setTimeout(() => setShowCelebration(false), 10000)
    }
    
    closeSignatureModal()
  }

  const clearModalSignature = () => {
    const canvas = modalCanvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
  }

  const clearSignature = async (type: "vik" | "decentCrook") => {
    const canvas = getCanvasRef(type).current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    
    const field = type === 'vik' ? 'vik_signature' : 'shalom_signature'
    const timestampField = type === 'vik' ? 'vik_signed_at' : 'shalom_signed_at'
    
    await supabase
      .from('signatures')
      .update({
        [field]: null,
        [timestampField]: null
      })
      .eq('id', 'love-contract')
    
    const newSignatures = { ...signatures, [type]: null }
    setSignatures(newSignatures)
  }

  const handlePrint = () => {
    window.print()
  }

  const openEnvelope = () => {
    setEnvelopeState("opening")
    setTimeout(() => {
      setEnvelopeState("open")
    }, 1500)
  }

  const handleNoHover = () => {
    const maxX = window.innerWidth - 150
    const maxY = window.innerHeight - 100
    const newX = Math.random() * maxX - maxX / 2
    const newY = Math.random() * maxY - maxY / 2
    setNoButtonPosition({ x: newX, y: newY })
  }

  const handleAccept = async () => {
    setAccepted(true)
    await supabase
      .from('signatures')
      .update({
        valentine_accepted: true,
        valentine_accepted_at: new Date().toISOString()
      })
      .eq('id', 'love-contract')
  }

  return (
    <div className="min-h-screen bg-background py-4 sm:py-8 px-2 sm:px-4 print:py-0 print:px-0">
      {/* Top Navigation - Hidden when printing */}
      <div className="fixed top-2 sm:top-4 right-2 sm:right-4 z-50 print:hidden flex gap-2">
        {currentPage === 2 && (
          <Button 
            onClick={() => setCurrentPage(1)}
            variant="outline"
            className="bg-card/90 backdrop-blur-sm text-sm"
          >
            <Heart className="w-3 h-3 mr-1 text-primary fill-primary" />
            <span className="hidden xs:inline">Love </span>Contract
          </Button>
        )}
        {currentPage === 3 && (
          <Button 
            onClick={() => setCurrentPage(1)}
            variant="outline"
            className="bg-card/90 backdrop-blur-sm text-sm"
          >
            <Heart className="w-3 h-3 mr-1 text-primary fill-primary" />
            <span className="hidden xs:inline">Love </span>Contract
          </Button>
        )}
        {currentPage === 1 && (
          <>
            <Button 
              onClick={() => setCurrentPage(2)}
              variant="outline"
              className="bg-card/90 backdrop-blur-sm text-sm"
            >
              <Sparkles className="w-3 h-3 mr-1 text-accent" />
              <span className="hidden xs:inline">Valentine </span>Surprise
            </Button>
            {signatures.vik && signatures.decentCrook && (
              <Button 
                onClick={() => setCurrentPage(3)}
                variant="outline"
                className="bg-card/90 backdrop-blur-sm text-sm"
              >
                <Heart className="w-3 h-3 mr-1 text-red-500 fill-red-500" />
                <span className="hidden xs:inline">Our </span>Love
              </Button>
            )}
          </>
        )}
        <Button 
          onClick={handlePrint}
          className="bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          <Printer className="w-4 h-4" />
          <span className="hidden sm:inline">Print as PDF</span>
        </Button>
      </div>

      {/* Page 1 - Contract */}
      {currentPage === 1 && (
        <div 
          ref={contractRef}
          className="max-w-3xl mx-auto bg-card rounded-lg shadow-2xl border-4 border-primary/20 overflow-hidden print:shadow-none print:border-2 print:max-w-none print:rounded-none"
        >
          {/* Decorative Header */}
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 p-4 sm:p-8 text-center border-b-2 border-primary/20 relative overflow-hidden">
            <div className="absolute top-2 left-2 sm:left-4 text-primary/30">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </div>
            <div className="absolute top-2 right-2 sm:right-4 text-primary/30">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-current" />
            </div>
            <div className="absolute bottom-2 left-1/4 text-primary/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="absolute bottom-2 right-1/4 text-primary/20">
              <Sparkles className="w-4 h-4" />
            </div>
            
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-primary tracking-wide">
              Permanent Contract
            </h1>
            <p className="text-muted-foreground mt-2 text-base sm:text-lg italic">
              Official Agreement
            </p>
            <div className="flex justify-center items-center gap-2 mt-3">
              <Heart className="w-4 h-4 text-primary fill-primary" />
              <Heart className="w-4 h-4 text-primary fill-primary" />
            </div>
          </div>

          {/* Contract Body */}
          <div className="p-4 sm:p-8 md:p-12 space-y-6 sm:space-y-8">
            {/* Opening */}
            <div className="text-center space-y-4">
              <p className="text-lg sm:text-xl text-foreground leading-relaxed font-serif italic">
                Dear Future Wife aka Decent Crook aka Crybaby aka Gangster,
              </p>
              <p className="text-base sm:text-lg text-foreground/90 leading-relaxed">
                Picture this: Vik FC{"'"}s star captain drops to one knee on the center circle, holding the ball like a ring, looking up at you with the most hopeful eyes...
              </p>
            </div>

            {/* The Big Question */}
            <div className="bg-primary/5 rounded-xl p-4 sm:p-6 border-2 border-primary/20 text-center">
              <p className="text-xl sm:text-2xl md:text-3xl font-serif text-primary font-semibold leading-relaxed">
                {"\""}If you would have me, I would love to sign you on a <span className="underline decoration-wavy decoration-accent">permanent contract</span>.{"\""}
              </p>
              <p className="text-base sm:text-lg text-muted-foreground mt-3 italic">
                No loan deals, no transfers, no release clauses. Just forever. Damn, forever sounds like a long time though 🤔
              </p>
            </div>

            {/* Article I */}
            <section className="space-y-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary border-b-2 border-primary/20 pb-2">
                Article I: The Heart of the Matter
              </h2>
              <p className="text-foreground/90 leading-relaxed text-base sm:text-lg">
                I loved the sweet card you gave me with a kiss for each day. Every single one made my heart skip a beat. 
                And now, I would love the chance to give you a kiss everyday on those beautiful lips of yours. 
                <span className="italic text-primary"> (Yes, I{"'"}m being bold, but can you blame me?)</span>
              </p>
              <p className="text-foreground/90 leading-relaxed text-base sm:text-lg">
                I want to spend more time with you — mornings, afternoons, late nights, and all the in-betweens. 
                You make even the boring moments feel like magic.
              </p>
            </section>

            {/* Article II */}
            <section className="space-y-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary border-b-2 border-primary/20 pb-2">
                Article II: Full Disclosure
              </h2>
              <p className="text-foreground/90 leading-relaxed text-base sm:text-lg">
                I hereby confess that I am, in fact, a complete crybaby. But only in one situation — 
                I get genuinely annoyed and emotional whenever I have to leave you. Any situation. Every time. 
                It doesn{"'"}t matter where or when, saying goodbye to you is the hardest thing I do.
              </p>
              <div className="bg-secondary/50 p-4 rounded-lg border border-primary/10">
                <p className="text-muted-foreground italic text-center text-sm sm:text-base">
                  Side Note: So if you ever see me sulking or being extra clingy before I leave, 
                  now you know why. I just don{"'"}t want to go.
                </p>
              </div>
            </section>

            {/* Article III */}
            <section className="space-y-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary border-b-2 border-primary/20 pb-2">
                Article III: Future Family Planning
              </h2>
              <p className="text-foreground/90 leading-relaxed text-base sm:text-lg">
                Cant believe we are already parents of 4 — <strong>Lala, Tasha, Mooshie, and Looshie</strong>. 😅
                But I{"'"}d love to expand our little family even more. More chaos, more love, more tiny paws running around.
              </p>
              <p className="text-foreground/90 leading-relaxed text-base sm:text-lg">
                I know we said 2 kids, but that{"'"}s negotiable... right? 😉
              </p>
              <p className="text-foreground/90 leading-relaxed text-base sm:text-lg italic">
                (Our family reunions are going to be legendary.)
              </p>
            </section>

            {/* Article IV - Mission Statement */}
            <section className="space-y-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary border-b-2 border-primary/20 pb-2">
                Article IV: My Mission Statement
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Heart className="w-5 h-5 text-primary fill-primary" />
                    <span className="font-semibold text-foreground">To Make You Smile</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Your smile is my favorite thing in this world. I want to be the reason behind it every single day. 
                    I{"'"}ll admit, there{"'"}s temptation on the naughty side... but I{"'"}ll restrain myself. 
                    <span className="italic"> (Most of the time. No promises.)</span>
                  </p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    <span className="font-semibold text-foreground">To Make You Giggly</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    I will tell bad jokes, do silly dances, and be generally ridiculous just to hear that adorable giggle. 
                    I{"'"}ll surprise you with unexpected gifts here and there — just because I can and because you deserve it.
                  </p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Gift className="w-5 h-5 text-primary" />
                    <span className="font-semibold text-foreground">A Special Request</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    Can you be a little less strict sometimes? Even though I absolutely love your strict version and find it incredibly sexy. 
                    <span className="italic"> (Yes, I said it. Sue me.)</span>
                  </p>
                </div>
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-2">
                    <Car className="w-5 h-5 text-accent" />
                    <span className="font-semibold text-foreground">Driving Promise</span>
                  </div>
                  <p className="text-muted-foreground text-sm">
                    I{"'"}ll also get my license so someone can finally be the one giving terrible directions instead of getting them! {"🤣😂🤣"}
                  </p>
                </div>
              </div>
              
              {/* Embarrassment Clause */}
              <div className="bg-accent/10 p-4 rounded-lg border border-accent/30 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <PartyPopper className="w-5 h-5 text-accent" />
                  <span className="font-semibold text-foreground">The Embarrassment Clause</span>
                </div>
                <p className="text-muted-foreground text-sm">
                  More importantly, I solemnly promise to pull stunts to embarrass you AND make you laugh — 
                  depending on the situation. So God help you! {"😂🤣😂"} 
                  <span className="italic"> (You{"'"}ve been warned, Decent Crook.)</span>
                </p>
              </div>
            </section>

            {/* Promises */}
            <section className="space-y-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary border-b-2 border-primary/20 pb-2">
                Article V: Promises from Vik FC
              </h2>
              <ul className="space-y-3 text-foreground/90">
                <li className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-primary fill-primary mt-1 shrink-0" />
                  <span>I{"'"}ll surprise you with special dates whenever I can</span>
                </li>
                <li className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-primary fill-primary mt-1 shrink-0" />
                  <span>I promise to always keep a smile on your face</span>
                </li>
                <li className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-primary fill-primary mt-1 shrink-0" />
                  <span>If I mess up, tell me straight — good or bad — so we fix it quick</span>
                </li>
                <li className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-primary fill-primary mt-1 shrink-0" />
                  <span>Honesty is key for both of us, always</span>
                </li>
                <li className="flex items-start gap-3">
                  <Heart className="w-5 h-5 text-primary fill-primary mt-1 shrink-0" />
                  <span>I reserve the right to tease you anytime, no hard feelings!</span>
                </li>
              </ul>
            </section>

            {/* Terms */}
            <section className="space-y-4">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary border-b-2 border-primary/20 pb-2">
                Article VI: General Terms
              </h2>
              <div className="bg-secondary/30 p-4 sm:p-6 rounded-xl border border-primary/10 space-y-3">
                <p className="text-foreground/90">
                  <strong>Duration:</strong> Forever and always (non-negotiable)
                </p>
                <p className="text-foreground/90">
                  <strong>Renewal Date:</strong> Every day I wake up next to you
                </p>
                <p className="text-foreground/90">
                  <strong>Release Clause:</strong> Does not exist. You{"'"}re stuck with me.
                </p>
                <p className="text-muted-foreground italic text-sm mt-4">
                  I{"'"}m open to any deals, even if you trick me a little, Decent Crook. 
                  Feel free to add your own clauses — this contract is as much yours as it is mine.
                </p>
              </div>
            </section>

            {/* Closing */}
            <div className="text-center space-y-4 py-6">
              <p className="text-base sm:text-lg text-foreground/90 italic">
                Let{"'"}s make this forever spell a winner!
              </p>
              <div className="flex justify-center items-center gap-2">
                <Heart className="w-5 h-5 text-primary fill-primary animate-pulse" />
                <Heart className="w-6 h-6 text-primary fill-primary animate-pulse" style={{ animationDelay: "75ms" }} />
                <Heart className="w-5 h-5 text-primary fill-primary animate-pulse" style={{ animationDelay: "150ms" }} />
              </div>
            </div>

            {/* Signature Section */}
            <section className="space-y-6 border-t-2 border-primary/20 pt-8">
              <h2 className="font-serif text-xl sm:text-2xl font-bold text-primary text-center">
                Official Signatures
              </h2>
              
              <div className="grid sm:grid-cols-2 gap-6 sm:gap-8">
                {/* Vik's Signature */}
                <div className="space-y-3">
                  <label className="font-serif text-base sm:text-lg font-semibold text-foreground block text-center">
                    Vik (Takunda/Taku)
                  </label>
                  <div 
                    className={`relative w-full h-24 border-2 rounded-lg bg-card ${
                      signatures.vik 
                        ? "border-primary/40" 
                        : "border-dashed border-primary/30 cursor-pointer hover:border-primary/50"
                    }`}
                    onClick={() => openSignatureModal("vik")}
                  >
                    <canvas
                      ref={vikCanvasRef}
                      width={280}
                      height={100}
                      className="w-full h-full pointer-events-none"
                    />
                    {!signatures.vik && (
                      <p className="absolute inset-0 flex items-center justify-center text-muted-foreground/50 pointer-events-none text-sm">
                        Tap to sign...
                      </p>
                    )}
                  </div>
                  {signatures.vik && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => clearSignature("vik")}
                      className="w-full print:hidden"
                    >
                      Clear Signature
                    </Button>
                  )}
                </div>

                {/* Decent Crook's Signature */}
                <div className="space-y-3">
                  <label className="font-serif text-base sm:text-lg font-semibold text-foreground block text-center">
                    Shalom aka Gangster (Decent Crook)
                  </label>
                  <div 
                    className={`relative w-full h-24 border-2 rounded-lg bg-card ${
                      signatures.decentCrook 
                        ? "border-primary/40" 
                        : "border-dashed border-primary/30 cursor-pointer hover:border-primary/50"
                    }`}
                    onClick={() => openSignatureModal("decentCrook")}
                  >
                    <canvas
                      ref={crookCanvasRef}
                      width={280}
                      height={100}
                      className="w-full h-full pointer-events-none"
                    />
                    {!signatures.decentCrook && (
                      <p className="absolute inset-0 flex items-center justify-center text-muted-foreground/50 pointer-events-none text-sm">
                        Tap to sign...
                      </p>
                    )}
                  </div>
                  {signatures.decentCrook && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => clearSignature("decentCrook")}
                      className="w-full print:hidden"
                    >
                      Clear Signature
                    </Button>
                  )}
                </div>
              </div>

              {/* Date */}
              <div className="text-center pt-4">
                <p className="text-muted-foreground text-sm sm:text-base">
                  Contract Date: <span className="font-semibold text-foreground">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </p>
                <p className="text-muted-foreground italic text-xs sm:text-sm mt-2">
                  Valid for eternity — or until the universe runs out of stars (whichever comes last)
                </p>
              </div>
            </section>

            {/* P.S. */}
            <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 p-4 sm:p-6 rounded-xl border border-primary/20 text-center">
              <p className="text-primary font-serif text-base sm:text-lg">
                P.S. I love you, Decent Crook. Will you be my girlfriend?
              </p>
              <div className="flex justify-center mt-3">
                <Heart className="w-8 h-8 text-primary fill-primary animate-pulse" />
              </div>
            </div>

            {/* Next Page Notice - Distinct and Noticeable */}
            <div className="print:hidden mt-8 p-4 sm:p-6 bg-gradient-to-r from-accent/20 via-primary/20 to-accent/20 rounded-2xl border-2 border-primary/40 shadow-lg animate-pulse">
              <div className="text-center space-y-4">
                <div className="flex justify-center items-center gap-2">
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                  <p className="text-lg sm:text-xl font-serif font-bold text-primary">
                    After signing, click NEXT below!
                  </p>
                  <Sparkles className="w-6 h-6 text-yellow-500" />
                </div>
                <p className="text-sm sm:text-base text-foreground/80 italic">
                  There{"'"}s a special surprise waiting for you on Page 2...
                </p>
                <div className="flex justify-center gap-2 mt-2">
                  <Heart className="w-4 h-4 text-primary fill-primary" />
                  <Heart className="w-5 h-5 text-primary fill-primary" />
                  <Heart className="w-4 h-4 text-primary fill-primary" />
                </div>
              </div>
            </div>

            {/* Page Switcher at Bottom - Mobile Friendly */}
            <div className="print:hidden mt-6 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm font-medium text-primary">Page 1</span>
                </div>
                <div className="w-12 h-0.5 bg-primary/30" />
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-primary/30" />
                  <span className="text-sm font-medium text-muted-foreground">Page 2</span>
                </div>
              </div>
              
              <Button 
                onClick={() => setCurrentPage(2)}
                className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-lg font-serif shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 gap-2"
              >
                <span>NEXT:  Surprise</span>
                <Heart className="w-5 h-5 fill-current" />
              </Button>
              <p className="text-muted-foreground text-xs">
                Tap to open your message
              </p>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-primary/5 p-4 text-center border-t-2 border-primary/20">
            <p className="text-muted-foreground text-sm">
              Page 1 of 2 - Love Contract
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Vik FC Official Documents - Est. with Love
            </p>
          </div>
        </div>
      )}

      {/* Page 2 - Stitch Envelope from Lala & Tasha */}
      {currentPage === 2 && (
        <div className="max-w-3xl mx-auto">
          <div className="bg-card rounded-lg shadow-2xl border-4 border-primary/20 overflow-hidden min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-8 relative">
            
            {/* Background Hearts */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              {[...Array(20)].map((_, i) => (
                <Heart
                  key={i}
                  className="absolute text-primary/10 fill-primary/10 animate-pulse"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    width: `${Math.random() * 20 + 10}px`,
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${Math.random() * 2 + 2}s`,
                  }}
                />
              ))}
            </div>

            {/* Label from Lala & Tasha */}
            <div className="text-center mb-6 sm:mb-8 relative z-10">
              <div className="inline-block bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 px-4 sm:px-6 py-2 rounded-full border-2 border-primary/30">
                <p className="font-serif text-base sm:text-lg text-primary font-semibold">
                  From: Lala, Tasha & Dad/Daddy
                </p>
                <p className="text-xs sm:text-sm text-muted-foreground italic">
                  (With love from your fur babies and their father) 😉
                </p>
              </div>
            </div>

            {/* Envelope */}
            {!accepted && (
              <div className="relative z-10">
                {envelopeState === "closed" && (
                  <div className="flex flex-col items-center">
                    {/* Stitch-style Envelope */}
                    <div className="relative w-64 h-44 sm:w-80 sm:h-52 cursor-pointer group">
                      {/* Envelope Body */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-xl border-4 border-blue-700">
                        {/* Stitch Pattern */}
                        <div className="absolute inset-2 border-2 border-dashed border-blue-300/50 rounded-md" />
                        
                        {/* Envelope Flap */}
                        <div className="absolute -top-1 left-0 right-0 h-20 sm:h-24">
                          <svg viewBox="0 0 320 100" className="w-full h-full">
                            <path 
                              d="M 0 0 L 160 70 L 320 0" 
                              fill="none" 
                              stroke="#1e40af" 
                              strokeWidth="4"
                            />
                            <path 
                              d="M 0 0 L 160 70 L 320 0 L 320 0 L 0 0" 
                              fill="#3b82f6"
                            />
                          </svg>
                        </div>

                        {/* Red Ribbon Horizontal */}
                        <div className="absolute top-1/2 left-0 right-0 h-4 sm:h-6 bg-gradient-to-b from-red-500 to-red-700 -translate-y-1/2 shadow-md" />
                        
                        {/* Red Ribbon Vertical */}
                        <div className="absolute top-0 bottom-0 left-1/2 w-4 sm:w-6 bg-gradient-to-r from-red-500 to-red-700 -translate-x-1/2 shadow-md" />
                        
                        {/* Ribbon Bow */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <div className="relative">
                            {/* Left Loop */}
                            <div className="absolute -left-6 sm:-left-8 -top-3 sm:-top-4 w-6 h-8 sm:w-8 sm:h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full rotate-[-30deg] border-2 border-red-700" />
                            {/* Right Loop */}
                            <div className="absolute -right-6 sm:-right-8 -top-3 sm:-top-4 w-6 h-8 sm:w-8 sm:h-10 bg-gradient-to-bl from-red-400 to-red-600 rounded-full rotate-[30deg] border-2 border-red-700" />
                            {/* Center Knot */}
                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-red-500 to-red-700 rounded-full border-2 border-red-800 relative z-10" />
                            {/* Ribbon Tails */}
                            <div className="absolute top-4 sm:top-5 left-1/2 -translate-x-1/2 flex gap-1">
                              <div className="w-2 sm:w-3 h-8 sm:h-10 bg-gradient-to-b from-red-500 to-red-700 rotate-[-15deg] rounded-b-full" />
                              <div className="w-2 sm:w-3 h-8 sm:h-10 bg-gradient-to-b from-red-500 to-red-700 rotate-[15deg] rounded-b-full" />
                            </div>
                          </div>
                        </div>

                        {/* Heart Seal */}
                        <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2">
                          <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 fill-red-500 drop-shadow-lg" />
                        </div>
                      </div>
                    </div>

                    {/* Click Here Button */}
                    <Button 
                      onClick={openEnvelope}
                      className="mt-6 sm:mt-8 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground px-6 sm:px-8 py-4 sm:py-6 text-base sm:text-lg font-serif shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      <Sparkles className="w-5 h-5 mr-2" />
                      Click Here to Open
                      <Heart className="w-5 h-5 ml-2 fill-current" />
                    </Button>
                  </div>
                )}

                {envelopeState === "opening" && (
                  <div className="flex flex-col items-center">
                    {/* Opening Animation */}
                    <div className="relative w-64 h-44 sm:w-80 sm:h-52">
                      {/* Envelope Body */}
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-lg shadow-xl border-4 border-blue-700 animate-pulse">
                        <div className="absolute inset-2 border-2 border-dashed border-blue-300/50 rounded-md" />
                      </div>
                      
                      {/* Animated Ribbons Flying Away */}
                      <div className="absolute top-1/2 left-0 right-0 h-4 sm:h-6 bg-gradient-to-b from-red-500 to-red-700 -translate-y-1/2 animate-[flyLeft_1s_ease-out_forwards]" />
                      <div className="absolute top-0 bottom-0 left-1/2 w-4 sm:w-6 bg-gradient-to-r from-red-500 to-red-700 -translate-x-1/2 animate-[flyUp_1s_ease-out_forwards]" />
                      
                      {/* Bow Flying */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-[flyAway_1s_ease-out_forwards]">
                        <div className="relative">
                          <div className="absolute -left-6 sm:-left-8 -top-3 sm:-top-4 w-6 h-8 sm:w-8 sm:h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-full rotate-[-30deg]" />
                          <div className="absolute -right-6 sm:-right-8 -top-3 sm:-top-4 w-6 h-8 sm:w-8 sm:h-10 bg-gradient-to-bl from-red-400 to-red-600 rounded-full rotate-[30deg]" />
                          <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-red-500 to-red-700 rounded-full relative z-10" />
                        </div>
                      </div>
                    </div>
                    
                    <p className="mt-6 text-primary font-serif text-lg animate-pulse">
                      Opening with love...
                    </p>
                  </div>
                )}

                {envelopeState === "open" && (
                  <div className="flex flex-col items-center animate-[fadeInUp_0.8s_ease-out]">
                    {/* Valentine Card */}
                    <div className="relative w-72 sm:w-96 bg-gradient-to-br from-pink-50 to-red-50 rounded-2xl shadow-2xl border-4 border-primary/30 overflow-hidden">
                      {/* Decorative Corner Hearts */}
                      <div className="absolute top-2 left-2">
                        <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-primary/40 fill-primary/40" />
                      </div>
                      <div className="absolute top-2 right-2">
                        <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-primary/40 fill-primary/40" />
                      </div>
                      <div className="absolute bottom-2 left-2">
                        <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-primary/40 fill-primary/40" />
                      </div>
                      <div className="absolute bottom-2 right-2">
                        <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-primary/40 fill-primary/40" />
                      </div>

                      {/* Card Content */}
                      <div className="p-6 sm:p-10 text-center space-y-4 sm:space-y-6">
                        {/* Sparkles */}
                        <div className="flex justify-center gap-2">
                          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 animate-pulse" />
                          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 animate-pulse" style={{ animationDelay: "200ms" }} />
                          <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-500 animate-pulse" style={{ animationDelay: "400ms" }} />
                        </div>

                        {/* Main Message */}
                        <div className="space-y-2">
                          <p className="text-muted-foreground text-sm sm:text-base">Dearest Gangster,</p>
                          <h2 className="font-serif text-3xl sm:text-5xl font-bold text-primary leading-tight">
                            Will You Be My Valentine?
                          </h2>
                        </div>

                        {/* Hearts Animation */}
                        <div className="flex justify-center items-center gap-2 py-2">
                          <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-primary fill-primary animate-bounce" />
                          <Heart className="w-8 h-8 sm:w-12 sm:h-12 text-red-500 fill-red-500 animate-pulse" />
                          <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-primary fill-primary animate-bounce" style={{ animationDelay: "200ms" }} />
                        </div>

                        {/* Sub Message */}
                        <p className="text-foreground/80 font-serif italic text-sm sm:text-base">
                          {"\""}You make my heart skip beats, my days brighter, and my life complete. 
                          Forever yours, always.{"\""}
                        </p>

                        <p className="text-muted-foreground text-xs sm:text-sm">
                          — With all my love, Vik
                        </p>

                        {/* Buttons */}
                        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-4 relative">
                          <Button
                            onClick={handleAccept}
                            className="bg-gradient-to-r from-primary to-red-500 hover:from-primary/90 hover:to-red-500/90 text-primary-foreground px-8 sm:px-12 py-4 sm:py-6 text-base sm:text-xl font-serif shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                          >
                            <Heart className="w-5 h-5 sm:w-6 sm:h-6 mr-2 fill-current" />
                            Yes, I Accept!
                            <Heart className="w-5 h-5 sm:w-6 sm:h-6 ml-2 fill-current" />
                          </Button>
                          
                          <Button
                            ref={noButtonRef}
                            variant="outline"
                            onMouseEnter={handleNoHover}
                            onTouchStart={handleNoHover}
                            className="bg-transparent px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base transition-all duration-200"
                            style={{
                              transform: `translate(${noButtonPosition.x}px, ${noButtonPosition.y}px)`,
                            }}
                          >
                            No
                          </Button>
                        </div>

                        <p className="text-muted-foreground/60 text-xs italic">
                          (Good luck clicking No... it{"'"}s a bit shy!)
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Accepted State */}
            {accepted && (
              <div className="text-center space-y-6 animate-[fadeInUp_0.8s_ease-out] relative z-10">
                <div className="flex justify-center">
                  <div className="relative animate-bounce">
                    <img 
                      src="/stitch.png" 
                      alt="Stitch" 
                      className="w-32 h-32 sm:w-48 sm:h-48 object-contain drop-shadow-2xl"
                    />
                    <Sparkles className="absolute top-0 right-0 w-8 h-8 text-yellow-500 animate-pulse" />
                    <Sparkles className="absolute bottom-0 left-0 w-8 h-8 text-yellow-500 animate-pulse" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
                <h2 className="font-serif text-3xl sm:text-5xl font-bold text-primary">
                  She Said Yes!
                </h2>
                {/* <p className="text-lg sm:text-xl text-foreground/80 font-serif italic max-w-md mx-auto">
                  And just like that, the world got a little brighter, my heart got a little fuller, 
                  and our story began its most beautiful chapter yet.
                </p> */}
                <div className="flex justify-center gap-2">
                  {[...Array(7)].map((_, i) => (
                    <Heart 
                      key={i} 
                      className="w-6 h-6 sm:w-8 sm:h-8 text-primary fill-primary animate-bounce" 
                      style={{ animationDelay: `${i * 100}ms` }}
                    />
                  ))}
                </div>
                <p className="text-muted-foreground text-sm sm:text-base">
                  Forever starts now, Decent Crook.
                </p>
              </div>
            )}
            
            {/* Page Switcher at Bottom - Page 2 */}
            <div className="print:hidden absolute bottom-4 left-0 right-0 flex flex-col items-center gap-3">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-primary/30" />
                  <span className="text-sm font-medium text-muted-foreground">Page 1</span>
                </div>
                <div className="w-12 h-0.5 bg-primary/30" />
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-primary" />
                  <span className="text-sm font-medium text-primary">Page 2</span>
                </div>
              </div>
              
              <Button 
                onClick={() => setCurrentPage(1)}
                variant="outline"
                className="bg-card/80 backdrop-blur-sm hover:bg-card px-6 py-3 font-serif shadow-lg gap-2"
              >
                <Heart className="w-4 h-4 text-primary fill-primary" />
                <span>Back to Love Contract</span>
              </Button>
            </div>
          </div>
          
          {/* Page 2 Footer */}
          <div className="bg-primary/5 p-4 text-center border-t-2 border-primary/20 mt-4 rounded-b-lg">
            <p className="text-muted-foreground text-sm">
              Page 2 of 2 - Valentine Surprise
            </p>
            <p className="text-muted-foreground text-xs mt-1">
              Vik FC Official Documents - Est. with Love
            </p>
          </div>
        </div>
      )}

      {/* Page 3 - Our Love (Only visible when both signed) */}
      {currentPage === 3 && signatures.vik && signatures.decentCrook && (
        <div className="max-w-4xl mx-auto">
          <div className="bg-card rounded-lg shadow-2xl border-4 border-primary/20 overflow-hidden min-h-[80vh] flex flex-col items-center justify-center p-4 sm:p-8 relative">
            <div className="text-center space-y-6 relative z-10">
              <h1 className="font-serif text-4xl sm:text-6xl font-bold text-primary">
                Forever Starts Now
              </h1>
              <div className="flex justify-center">
                <img 
                  src="/sv.jpg" 
                  alt="Our Love" 
                  className="max-w-full h-auto rounded-2xl shadow-2xl border-4 border-primary/30 max-h-[60vh] object-contain"
                />
              </div>
              <p className="text-xl sm:text-2xl text-foreground/80 font-serif italic max-w-2xl mx-auto">
                Two signatures, one heart, infinite love.
              </p>
              <div className="flex justify-center gap-2">
                {[...Array(9)].map((_, i) => (
                  <Heart 
                    key={i} 
                    className="w-6 h-6 sm:w-8 sm:h-8 text-red-500 fill-red-500 animate-pulse" 
                    style={{ animationDelay: `${i * 100}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Celebration Modal */}
      {showCelebration && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="text-center space-y-6 animate-[fadeInUp_0.5s_ease-out]">
            <h1 className="text-6xl sm:text-8xl font-serif font-bold text-white animate-bounce">
              Yeeei! 🎉
            </h1>
            <div className="animate-[pulse_2s_ease-in-out_infinite]">
              <img 
                src="/sv.jpg" 
                alt="Celebration" 
                className="w-64 h-64 sm:w-96 sm:h-96 object-cover rounded-2xl shadow-2xl border-4 border-white"
              />
            </div>
          </div>
        </div>
      )}

      {/* Signature Modal */}
      <Dialog open={!!signatureModal} onOpenChange={(open) => !open && closeSignatureModal()}>
        <DialogContent className="max-w-lg w-[95vw] p-0">
          <DialogHeader className="p-4 pb-2">
            <DialogTitle className="font-serif text-xl text-center">
              Sign Here - {signatureModal === "vik" ? "Vik (Takunda/Taku)" : "Shalom - (Decent Crook)"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4 space-y-4">
            <div className="relative bg-card border-2 border-primary/30 rounded-lg overflow-hidden">
              <canvas
                ref={modalCanvasRef}
                width={600}
                height={300}
                className="w-full touch-none"
                style={{ touchAction: 'none' }}
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
                onTouchStart={startDrawing}
                onTouchMove={draw}
                onTouchEnd={stopDrawing}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={clearModalSignature}
                className="flex-1"
              >
                <X className="w-4 h-4 mr-2" />
                Clear
              </Button>
              <Button
                onClick={saveSignature}
                className="flex-1 bg-primary text-primary-foreground"
              >
                <Heart className="w-4 h-4 mr-2 fill-current" />
                Save Signature
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Custom Animations & Print styles */}
      <style jsx global>{`
        @keyframes flyLeft {
          0% { transform: translateY(-50%) translateX(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(-50%) translateX(-200px) rotate(-45deg); opacity: 0; }
        }
        @keyframes flyUp {
          0% { transform: translateX(-50%) translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateX(-50%) translateY(-200px) rotate(45deg); opacity: 0; }
        }
        @keyframes flyAway {
          0% { transform: translate(-50%, -50%) scale(1) rotate(0deg); opacity: 1; }
          100% { transform: translate(-50%, -300%) scale(0.5) rotate(180deg); opacity: 0; }
        }
        @keyframes fadeInUp {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @media print {
          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>
    </div>
  )
}

"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, useFieldArray } from "react-hook-form"
import * as z from "zod"
import { motion, AnimatePresence } from "framer-motion"
import { Loader2, CheckCircle2, RefreshCcw, Plus, Trash2, CreditCard, ChevronRight } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import { useTheme } from "next-themes"
import { TravelIssuedForm, type TravelIssuedData } from "@/components/TravelIssuedForm"
import { TravelPlannedForm, type TravelPlannedData } from "@/components/TravelPlannedForm"
import { generateAndUploadPDF } from "@/lib/generatePDF"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BANK_DATA } from "@/lib/bank-data"
import { ModeToggle } from "@/components/mode-toggle"

// Form Schema
const cardSchema = z.object({
    bank: z.string().min(1, { message: "Selecione o banco" }),
    bankOther: z.string().optional(),
    card: z.string().min(1, { message: "Selecione o cartão" }),
    cardOther: z.string().optional(),
    brand: z.string().min(1, { message: "Selecione a bandeira" }),
    brandOther: z.string().optional(),
    category: z.string().min(1, { message: "Selecione a categoria" }),
    categoryOther: z.string().optional(),
    monthlySpend: z.string().min(1, { message: "Informe o gasto médio" }),
    annuityFree: z.string().min(1, { message: "Selecione o status da anuidade" }),
})

const formSchema = z.object({
    fullName: z.string().min(3, { message: "Nome completo é obrigatório" }),
    phone: z.string().min(14, { message: "WhatsApp inválido" }),
    email: z.string().email({ message: "E-mail inválido" }),
    cards: z.array(cardSchema).min(1, { message: "Adicione pelo menos um cartão" }).max(5),
})

type FormValues = z.infer<typeof formSchema>

const STORAGE_KEY = "coleta-dados-ffp-draft"

const defaultTrip = {
    departureDate: "", returnDate: "", country: "", city: "",
    multipleDestinations: "", extraDestinations: "", adults: "", children: "", babies: "",
    travelReason: "", travelReasonOther: "", services: [], unreservedServices: [],
    unreservedOther: "", budget: "", teamOptimize: "", travelNotes: ""
}

const defaultTravelIssued: TravelIssuedData = {
    hasIssuedTrips: "", trips: [defaultTrip]
}

const defaultTravelPlanned: TravelPlannedData = {
    hasPlannedTrip: "", country: "", city: "", multipleDestinations: "", extraDestinations: "",
    timeframe: "", plannedDepartureDate: "", plannedReturnDate: "", adults: "", children: "",
    babies: "", travelReason: "", travelReasonOther: "", plannedServices: [],
    plannedServicesOther: "", budget: "", teamHelp: "", teamHelpNotes: "",
}

export function ColetaDadosForm() {
    const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1)
    const [dealId, setDealId] = useState<number | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [travelIssued, setTravelIssued] = useState<TravelIssuedData>(defaultTravelIssued)
    const [travelPlanned, setTravelPlanned] = useState<TravelPlannedData>(defaultTravelPlanned)
    const { resolvedTheme } = useTheme()
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            fullName: "",
            phone: "",
            email: "",
            cards: [{ bank: "", card: "", brand: "", category: "", monthlySpend: "", annuityFree: "" }],
        },
    })

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "cards",
    })

    // Persistence: Load draft on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY)
        if (saved) {
            try {
                const parsed = JSON.parse(saved)
                if (parsed.step1) form.reset(parsed.step1)
                if (parsed.step2) setTravelIssued(parsed.step2)
                if (parsed.step3) setTravelPlanned(parsed.step3)
                if (parsed.currentStep) setCurrentStep(parsed.currentStep)
                if (parsed.dealId) setDealId(parsed.dealId)
            } catch (e) {
                console.error("Error loading draft", e)
            }
        }
    }, [form])

    // Persistence: Save draft on each change
    useEffect(() => {
        const subscription = form.watch((value) => {
            const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
            localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, step1: value, currentStep, dealId }))
        })
        return () => subscription.unsubscribe()
    }, [form, currentStep, dealId])

    function saveTravelData(step2: TravelIssuedData, step3?: TravelPlannedData) {
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, step2, ...(step3 ? { step3 } : {}) }))
    }

    // Phone Mask: (99) 99999-9999 (Ignoring +55)
    const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: string) => void) => {
        let val = e.target.value.replace(/\D/g, "")

        // Remove 55 prefix if present (Brasil country code)
        if (val.startsWith("55") && val.length > 2) {
            val = val.slice(2)
        }

        if (val.length > 11) val = val.slice(0, 11)

        let formatted = val
        if (val.length > 2) formatted = `(${val.slice(0, 2)}) ${val.slice(2)}`
        if (val.length > 7) formatted = `(${val.slice(0, 2)}) ${val.slice(2, 7)}-${val.slice(7)}`

        onChange(formatted)
    }

    // Currency Mask: R$ 0.000,00
    const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>, onChange: (val: string) => void) => {
        const value = e.target.value.replace(/\D/g, "")
        if (value === "") {
            onChange("")
            return
        }

        const numberValue = parseInt(value) / 100
        const formattedValue = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
        }).format(numberValue)

        onChange(formattedValue)
    }

    // Step 1 → Submit to Bitrix, go to step 2
    async function onSubmit(values: FormValues) {
        setIsSubmitting(true)
        const toastId = toast.loading("Salvando seus dados...")
        try {
            const response = await fetch('/api/bitrix/submit', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(values),
            })
            const result = await response.json()
            if (response.ok || result.partialSuccess) {
                if (result.dealId) {
                    setDealId(result.dealId)
                    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
                    localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, dealId: result.dealId, currentStep: 2 }))
                }
                toast.success("Etapa 1 salva! Vamos continuar.", { id: toastId })
                setCurrentStep(2)
            } else {
                toast.error("Erro ao salvar etapa 1. Tente novamente.", { id: toastId })
            }
        } catch (error) {
            toast.error("Erro na conexão. Tente novamente.", { id: toastId })
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Step 2 → Update deal, go to step 3 (or skip to step 3 directly if no trips)
    async function handleTravelIssuedNext(data: TravelIssuedData, skipToPage3: boolean) {
        setTravelIssued(data)
        saveTravelData(data)
        if (dealId) {
            setIsSubmitting(true)
            try {
                await fetch('/api/bitrix/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ dealId, step: 2, data }),
                })
            } catch (e) {
                console.error('Step 2 Bitrix update failed (non-fatal):', e)
            } finally {
                setIsSubmitting(false)
            }
        }
        const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}")
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...existing, currentStep: 3 }))
        setCurrentStep(3)
    }

    // Step 3 → Final submission
    async function handleTravelPlannedSubmit(data: TravelPlannedData) {
        setTravelPlanned(data)
        saveTravelData(travelIssued, data)
        setIsSubmitting(true)
        const toastId = toast.loading("Enviando tudo para a gestão...")
        try {
            if (dealId) {
                // Prepare full form data for PDF
                const fullFormData = {
                    ...form.getValues(),
                    step2: travelIssued,
                    step3: data
                }
                const pdfUrl = await generateAndUploadPDF(fullFormData, form.getValues().email)

                if (!pdfUrl) {
                    toast.warning("Não foi possível enviar o PDF para o servidor.", {
                        description: "Verifique as permissões (RLS) do bucket no Supabase ou veja o console.",
                    });
                }

                // Add PDF url to the bitrix update data if it exists
                const updatePayload = {
                    dealId,
                    step: 3,
                    data: {
                        ...data,
                        pdfUrl: pdfUrl || ""
                    }
                }

                const response = await fetch('/api/bitrix/update', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatePayload),
                })
                const result = await response.json()
                if (response.ok || result.success) {
                    toast.success("Dados enviados com sucesso!", { id: toastId })
                    localStorage.removeItem(STORAGE_KEY)
                    setIsSuccess(true)
                } else {
                    toast.error("Erro ao finalizar envio. Tente novamente.", { id: toastId })
                }
            } else {
                // No dealId — save data locally as fallback
                toast.success("Dados registrados localmente!", { id: toastId })
                localStorage.removeItem(STORAGE_KEY)
                setIsSuccess(true)
            }
        } catch (error) {
            toast.error("Erro na conexão.", { id: toastId })
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isSuccess) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center p-8 text-center max-w-md mx-auto bg-card rounded-2xl shadow-2xl border border-primary/10"
            >
                <div className="relative w-48 h-12 mb-8">
                    <Image src={mounted && resolvedTheme === "dark" ? "/Black.png" : "/Light.png"} alt="Logo" fill className="object-contain" priority />
                </div>
                <div className="bg-primary/10 p-4 rounded-full mb-6">
                    <CheckCircle2 className="w-12 h-12 text-primary" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight mb-2">Tudo Certo!</h2>
                <p className="text-muted-foreground leading-relaxed">
                    Recebemos seus dados. Nossa equipe de gestão entrará em contato em breve para os próximos passos.
                </p>
                <Button onClick={() => {
                    setIsSuccess(false)
                    setCurrentStep(1)
                    form.reset()
                    setTravelIssued(defaultTravelIssued)
                    setTravelPlanned(defaultTravelPlanned)
                    setDealId(null)
                    localStorage.removeItem(STORAGE_KEY)
                }} variant="default" className="mt-8 rounded-full px-8 text-white hover:text-[#e34248]">
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Voltar ao Início
                </Button>
            </motion.div>
        )
    }

    // Shared Card wrapper used across all steps
    const stepTitle = currentStep === 1 ? "1/3" : currentStep === 2 ? "2/3" : "3/3"
    const stepSubtitle = currentStep === 1
        ? "Preencha com atenção os detalhes do seu banco, cartão, bandeira e categoria"
        : currentStep === 2
            ? "Preencha com atenção os detalhes das viagens já emitidas"
            : "Preencha com atenção os detalhes da sua viagem planejada"

    return (
        <Card className="w-full shadow-2xl border-primary/10 bg-card/80 backdrop-blur-xl flex flex-col overflow-hidden max-h-[95vh]">
            <CardHeader className="relative border-b border-primary/5 p-4 pb-3">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    {/* Logo Section */}
                    <div className="flex items-center justify-center md:justify-start md:absolute md:left-4">
                        <div className="relative w-40 h-10 md:w-48 md:h-12">
                            <Image
                                src={mounted && resolvedTheme === "dark" ? "/Black.png" : "/Light.png"}
                                alt="Logo"
                                fill
                                className="object-contain"
                                priority
                            />
                        </div>
                    </div>

                    {/* Title & Subtitle Section - Absolutely Centered on Desktop */}
                    <div className="flex flex-col items-center justify-center text-center flex-1 px-4">
                        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground uppercase whitespace-nowrap">
                            FORMULÁRIO PARA GESTÃO
                        </h1>
                        <p className="text-[10px] md:text-xs text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis w-full max-w-[calc(100vw-4rem)] md:max-w-none">
                            {stepSubtitle}
                        </p>
                    </div>

                    {/* Desktop Theme Toggle - Positioned on the right */}
                    <div className="hidden md:flex items-center md:absolute md:right-4">
                        <ModeToggle />
                    </div>
                </div>

                {/* Mobile Theme Toggle - Positioned for accessibility */}
                <div className="absolute right-4 top-4 md:hidden">
                    <ModeToggle />
                </div>
            </CardHeader>

            {currentStep === 1 && (
                <CardContent className="p-4 md:p-5 overflow-y-auto custom-scrollbar">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            {/* Identification & Contact */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <FormField
                                    control={form.control}
                                    name="fullName"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">Nome Completo</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Seu nome completo" className="bg-background/40 h-11" autoComplete="name" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="phone"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">WhatsApp</FormLabel>
                                            <FormControl>
                                                <Input
                                                    placeholder="(00) 00000-0000"
                                                    className="bg-background/40 h-11"
                                                    autoComplete="tel"
                                                    {...field}
                                                    onChange={(e) => handlePhoneChange(e, field.onChange)}
                                                />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="email"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="text-xs uppercase tracking-wider text-muted-foreground">E-mail</FormLabel>
                                            <FormControl>
                                                <Input placeholder="seu@email.com" type="email" className="bg-background/40 h-11" autoComplete="email" {...field} />
                                            </FormControl>
                                            <FormMessage className="text-[10px]" />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            {/* Cards Section */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                                        <CreditCard className="w-3 h-3" />
                                        Dados dos Cartões
                                    </h3>
                                </div>

                                <AnimatePresence mode="popLayout">
                                    {fields.map((field, index) => {
                                        const watchValues = form.watch(`cards.${index}`)
                                        const watchCardBank = watchValues?.bank
                                        const watchCardName = watchValues?.card
                                        const watchBrand = watchValues?.brand
                                        const watchCategory = watchValues?.category
                                        const watchMonthlySpend = watchValues?.monthlySpend

                                        const availableCardsList = watchCardBank && BANK_DATA[watchCardBank]
                                            ? Object.keys(BANK_DATA[watchCardBank].cards)
                                            : []

                                        const enabled = {
                                            card: !!watchCardBank,
                                            brand: !!watchCardName,
                                            category: !!watchBrand,
                                            monthlySpend: !!watchCategory,
                                            annuityFree: !!watchMonthlySpend
                                        }

                                        return (
                                            <motion.div
                                                key={field.id}
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                exit={{ opacity: 0, x: 10 }}
                                                className="relative p-4 rounded-xl border border-primary/10 bg-primary/[0.02] space-y-4"
                                            >
                                                <div className="flex items-center justify-between border-b border-primary/5 pb-2">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-primary/60">Cartão {index + 1}</span>
                                                    {fields.length > 1 && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                                            onClick={() => remove(index)}
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="flex flex-col gap-4">
                                                    {/* Line 1: Main data */}
                                                    <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr_1fr_1fr] gap-2">
                                                        {/* Bank Selection */}
                                                        <FormField
                                                            control={form.control}
                                                            name={`cards.${index}.bank`}
                                                            render={({ field: bankField }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Banco</FormLabel>
                                                                    <Select onValueChange={(val) => {
                                                                        bankField.onChange(val)
                                                                        // Reset all dependent fields
                                                                        form.setValue(`cards.${index}.card`, "")
                                                                        form.setValue(`cards.${index}.brand`, "")
                                                                        form.setValue(`cards.${index}.category`, "")
                                                                        form.setValue(`cards.${index}.monthlySpend`, "")
                                                                        form.setValue(`cards.${index}.annuityFree`, "")
                                                                    }} value={bankField.value}>
                                                                        <FormControl>
                                                                            <SelectTrigger className="bg-background/40 h-11 text-xs">
                                                                                <SelectValue placeholder="Selecione o Banco" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent className="max-h-[300px] min-w-[max-content] w-[var(--radix-select-trigger-width)]">
                                                                            {Object.keys(BANK_DATA).map(bank => (
                                                                                <SelectItem key={bank} value={bank} className="text-xs">{bank}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage className="text-[8px]" />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        {/* Card Selection */}
                                                        <FormField
                                                            control={form.control}
                                                            name={`cards.${index}.card`}
                                                            render={({ field: cardField }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Cartão</FormLabel>
                                                                    <Select
                                                                        disabled={!enabled.card}
                                                                        onValueChange={(val) => {
                                                                            cardField.onChange(val)
                                                                            if (watchCardBank && watchCardBank !== "Outro banco" && BANK_DATA[watchCardBank as keyof typeof BANK_DATA] && val !== "Outro cartao") {
                                                                                const cardInfo = BANK_DATA[watchCardBank as keyof typeof BANK_DATA].cards[val as any]
                                                                                form.setValue(`cards.${index}.brand`, cardInfo.brand)
                                                                                form.setValue(`cards.${index}.category`, cardInfo.category)
                                                                            }
                                                                        }}
                                                                        value={cardField.value}
                                                                    >
                                                                        <FormControl>
                                                                            <SelectTrigger className="bg-background/40 h-11 text-xs">
                                                                                <SelectValue placeholder="Cartão" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent className="max-h-[300px] min-w-[max-content] w-[var(--radix-select-trigger-width)]">
                                                                            {availableCardsList.map(card => (
                                                                                <SelectItem key={card} value={card} className="text-xs">{card}</SelectItem>
                                                                            ))}
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage className="text-[8px]" />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        {/* Brand Selection */}
                                                        <FormField
                                                            control={form.control}
                                                            name={`cards.${index}.brand`}
                                                            render={({ field: brandField }) => {
                                                                const watchCard = form.watch(`cards.${index}.card`)
                                                                const watchBank = form.watch(`cards.${index}.bank`)

                                                                const getAvailableBrands = () => {
                                                                    const defaultBrands = ["Visa", "Mastercard", "Amex", "Elo", "Centurion", "Outro"]
                                                                    if (!watchBank || !watchCard || watchBank === "Outro banco" || watchCard === "Outro cartao") {
                                                                        return defaultBrands
                                                                    }
                                                                    const bankInfo = BANK_DATA[watchBank as keyof typeof BANK_DATA]
                                                                    if (!bankInfo) return defaultBrands
                                                                    const cardInfo = bankInfo.cards[watchCard as any]
                                                                    if (!cardInfo) return defaultBrands

                                                                    const brands = cardInfo.brand.split("/").map(b => b.trim())
                                                                    if (!brands.includes("Outro")) brands.push("Outro")
                                                                    return brands
                                                                }

                                                                const availableBrands = getAvailableBrands()

                                                                return (
                                                                    <FormItem>
                                                                        <FormLabel className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Bandeira</FormLabel>
                                                                        <Select
                                                                            disabled={!enabled.brand}
                                                                            onValueChange={brandField.onChange}
                                                                            value={brandField.value}
                                                                        >
                                                                            <FormControl>
                                                                                <SelectTrigger className="bg-background/40 h-11 text-xs">
                                                                                    <SelectValue placeholder="Bandeira" />
                                                                                </SelectTrigger>
                                                                            </FormControl>
                                                                            <SelectContent className="max-h-[300px] min-w-[max-content] w-[var(--radix-select-trigger-width)]">
                                                                                {availableBrands.map(b => (
                                                                                    <SelectItem key={b} value={b} className="text-xs">{b}</SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <FormMessage className="text-[8px]" />
                                                                    </FormItem>
                                                                )
                                                            }}
                                                        />

                                                        {/* Category Selection */}
                                                        <FormField
                                                            control={form.control}
                                                            name={`cards.${index}.category`}
                                                            render={({ field: catField }) => {
                                                                const watchCard = form.watch(`cards.${index}.card`)
                                                                const watchBank = form.watch(`cards.${index}.bank`)

                                                                const getAvailableCategories = () => {
                                                                    const defaultCategories = ["Standard", "Gold", "Platinum", "Black", "Infinite", "Signature", "Centurion", "Nanquim", "Outro"]
                                                                    if (!watchBank || !watchCard || watchBank === "Outro banco" || watchCard === "Outro cartao") {
                                                                        return defaultCategories
                                                                    }
                                                                    const bankInfo = BANK_DATA[watchBank as keyof typeof BANK_DATA]
                                                                    if (!bankInfo) return defaultCategories
                                                                    const cardInfo = bankInfo.cards[watchCard as any]
                                                                    if (!cardInfo) return defaultCategories

                                                                    const categories = cardInfo.category.split("/").map(c => c.trim())
                                                                    if (!categories.includes("Outro")) categories.push("Outro")
                                                                    return categories
                                                                }

                                                                const availableCategories = getAvailableCategories()

                                                                return (
                                                                    <FormItem>
                                                                        <FormLabel className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Categoria</FormLabel>
                                                                        <Select
                                                                            disabled={!enabled.category}
                                                                            onValueChange={catField.onChange}
                                                                            value={catField.value}
                                                                        >
                                                                            <FormControl>
                                                                                <SelectTrigger className="bg-background/40 h-11 text-xs">
                                                                                    <SelectValue placeholder="Categoria" />
                                                                                </SelectTrigger>
                                                                            </FormControl>
                                                                            <SelectContent className="max-h-[300px] min-w-[max-content] w-[var(--radix-select-trigger-width)]">
                                                                                {availableCategories.map(c => (
                                                                                    <SelectItem key={c} value={c} className="text-xs">{c}</SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                        <FormMessage className="text-[8px]" />
                                                                    </FormItem>
                                                                )
                                                            }}
                                                        />
                                                    </div>

                                                    {/* Line 2: Financial data */}
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                                        {/* Monthly Spend */}
                                                        <FormField
                                                            control={form.control}
                                                            name={`cards.${index}.monthlySpend`}
                                                            render={({ field: spendField }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Gasto Médio</FormLabel>
                                                                    <FormControl>
                                                                        <Input
                                                                            disabled={!enabled.monthlySpend}
                                                                            placeholder="Gasto Médio Mensal"
                                                                            className="bg-background/40 h-11 text-xs px-3"
                                                                            {...spendField}
                                                                            onChange={(e) => handleCurrencyChange(e, spendField.onChange)}
                                                                        />
                                                                    </FormControl>
                                                                    <FormMessage className="text-[8px]" />
                                                                </FormItem>
                                                            )}
                                                        />

                                                        {/* Annuity Free Selection */}
                                                        <FormField
                                                            control={form.control}
                                                            name={`cards.${index}.annuityFree`}
                                                            render={({ field: annuityField }) => (
                                                                <FormItem>
                                                                    <FormLabel className="text-[9px] uppercase tracking-wider text-muted-foreground font-semibold">Anuidade</FormLabel>
                                                                    <Select
                                                                        disabled={!enabled.annuityFree}
                                                                        onValueChange={annuityField.onChange}
                                                                        value={annuityField.value}
                                                                    >
                                                                        <FormControl>
                                                                            <SelectTrigger className="bg-background/40 h-11 text-xs">
                                                                                <SelectValue placeholder="Livre de Anuidade?" />
                                                                            </SelectTrigger>
                                                                        </FormControl>
                                                                        <SelectContent>
                                                                            <SelectItem value="SIM" className="text-xs">SIM (Livre)</SelectItem>
                                                                            <SelectItem value="NÃO" className="text-xs">NÃO (Paga)</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                    <FormMessage className="text-[8px]" />
                                                                </FormItem>
                                                            )}
                                                        />
                                                    </div>
                                                </div>

                                                {/* Other Inputs */}
                                                <AnimatePresence>
                                                    {(watchCardBank === "Outro banco" || watchCardName === "Outro cartao" || watchBrand === "Outro" || watchCategory === "Outro") && (
                                                        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-primary/5 mt-2">
                                                            {watchCardBank === "Outro banco" && (
                                                                <FormField control={form.control} name={`cards.${index}.bankOther`} render={({ field }) => (
                                                                    <Input placeholder="Qual o Banco?" className="h-10 text-xs bg-background/60" {...field} />
                                                                )} />
                                                            )}
                                                            {watchCardName === "Outro cartao" && (
                                                                <FormField control={form.control} name={`cards.${index}.cardOther`} render={({ field }) => (
                                                                    <Input placeholder="Qual o Cartão?" className="h-10 text-xs bg-background/60" {...field} />
                                                                )} />
                                                            )}
                                                            {watchBrand === "Outro" && (
                                                                <FormField control={form.control} name={`cards.${index}.brandOther`} render={({ field }) => (
                                                                    <Input placeholder="Qual a Bandeira?" className="h-10 text-xs bg-background/60" {...field} />
                                                                )} />
                                                            )}
                                                            {watchCategory === "Outro" && (
                                                                <FormField control={form.control} name={`cards.${index}.categoryOther`} render={({ field }) => (
                                                                    <Input placeholder="Qual a Categoria?" className="h-10 text-xs bg-background/60" {...field} />
                                                                )} />
                                                            )}
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        )
                                    })}
                                </AnimatePresence>

                                {fields.length < 5 && (
                                    <div className="flex justify-center pt-2">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            className="h-10 px-8 border-dashed border-primary/30 hover:border-primary/60 hover:bg-primary/5 text-primary transition-all rounded-lg font-bold text-xs"
                                            onClick={() => append({ bank: "", card: "", brand: "", category: "", monthlySpend: "", annuityFree: "" })}
                                        >
                                            <Plus className="w-4 h-4 mr-2" />
                                            ADICIONAR NOVO CARTÃO
                                        </Button>
                                    </div>
                                )}
                            </div>


                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                variant="outline"
                                className="w-full h-14 text-sm font-bold border-border hover:bg-accent active:scale-[0.98] transition-all rounded-lg gap-2"
                            >
                                {isSubmitting ? <Loader2 className="animate-spin w-4 h-4" /> : null}
                                {isSubmitting ? "PROCESSANDO..." : "PRÓXIMO 1/3"}
                                {!isSubmitting && <ChevronRight className="w-4 h-4" />}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            )}

            {/* Step 2 - Travels Issued */}
            {currentStep === 2 && (
                <CardContent className="flex-1 overflow-y-auto p-4 md:p-6">
                    <TravelIssuedForm
                        initialData={travelIssued}
                        onNext={handleTravelIssuedNext}
                        onBack={() => setCurrentStep(1)}
                        isSubmitting={isSubmitting}
                    />
                </CardContent>
            )}

            {/* Step 3 - Planned Travel */}
            {currentStep === 3 && (
                <CardContent className="flex-1 overflow-y-auto p-4 md:p-6">
                    <TravelPlannedForm
                        initialData={travelPlanned}
                        onSubmit={handleTravelPlannedSubmit}
                        onBack={() => setCurrentStep(2)}
                        isSubmitting={isSubmitting}
                    />
                </CardContent>
            )}
        </Card>
    )
}

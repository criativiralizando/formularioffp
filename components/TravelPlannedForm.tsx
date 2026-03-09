"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Send } from "lucide-react"

export interface TravelPlannedData {
    hasPlannedTrip: string
    country: string
    city: string
    multipleDestinations: string
    extraDestinations: string
    timeframe: string
    plannedDepartureDate: string
    plannedReturnDate: string
    adults: string
    children: string
    babies: string
    travelReason: string
    travelReasonOther: string
    plannedServices: string[]
    plannedServicesOther: string
    budget: string
    teamHelp: string
    teamHelpNotes: string
}

const SERVICE_GROUPS = [
    {
        label: "Transporte",
        items: ["Passagem aérea", "Trem", "Cruzeiro", "Aluguel de carro", "Transfer aeroporto ↔ hotel", "Transporte - Outro"],
    },
    {
        label: "Hospedagem",
        items: ["Hotel", "Resort", "Hostel", "Airbnb / apartamento", "All inclusive", "Hospedagem - Outro"],
    },
    {
        label: "Experiências",
        items: ["Passeios / tours", "Parques temáticos", "Ingressos de eventos", "Experiências gastronômicas", "Eventos esportivos", "Experiências - Outro"],
    },
    {
        label: "Serviços adicionais",
        items: ["Seguro viagem", "Chip de internet internacional", "Visto / documentação", "Sala VIP aeroporto", "Planejamento completo da viagem", "Serviços - Outro"],
    },
]

const TRAVEL_REASONS = ["Lazer", "Negócios", "Evento", "Lua de mel", "Família", "Compras", "Estudo", "Outro"]
const BUDGETS = ["Até R$ 5.000", "R$ 5.000 – R$ 10.000", "R$ 10.000 – R$ 25.000", "R$ 25.000 – R$ 50.000", "Acima de R$ 50.000"]
const TIMEFRAMES = ["Nos próximos 3 meses", "Entre 3 e 6 meses", "Entre 6 e 12 meses", "Mais de 1 ano", "Ainda não tenho data definida"]

function SectionLabel({ children }: { children: React.ReactNode }) {
    return <p className="text-xs font-bold text-primary uppercase tracking-wider mt-4 mb-1">{children}</p>
}

function FieldLabel({ children }: { children: React.ReactNode }) {
    return (
        <Label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1">
            {children}
        </Label>
    )
}

interface Props {
    initialData: TravelPlannedData
    onSubmit: (data: TravelPlannedData) => void
    onBack: () => void
    isSubmitting: boolean
}

export function TravelPlannedForm({ initialData, onSubmit, onBack, isSubmitting }: Props) {
    const [data, setData] = useState<TravelPlannedData>(initialData)

    function setField<K extends keyof TravelPlannedData>(key: K, value: TravelPlannedData[K]) {
        setData(prev => ({ ...prev, [key]: value }))
    }

    function toggleService(item: string) {
        setData(prev => ({
            ...prev,
            plannedServices: prev.plannedServices.includes(item)
                ? prev.plannedServices.filter(s => s !== item)
                : [...prev.plannedServices, item],
        }))
    }

    const hasPlanned = data.hasPlannedTrip === "Sim"
    const showDates = data.timeframe && data.timeframe !== "Ainda não tenho data definida"

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
        >
            {/* Q1 */}
            <SectionLabel>Você tem alguma viagem certa, mas ainda não reservou nada?</SectionLabel>
            <Select value={data.hasPlannedTrip} onValueChange={v => setField("hasPlannedTrip", v || "")}>
                <SelectTrigger className="bg-background/40 h-11 text-sm">
                    <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                </SelectContent>
            </Select>

            {hasPlanned && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
                    {/* Q2 - Destination */}
                    <SectionLabel>Para onde pretende viajar?</SectionLabel>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                            <FieldLabel>País</FieldLabel>
                            <Input className="bg-background/40 h-11" placeholder="Ex: Brasil, Portugal..." value={data.country}
                                autoComplete="country-name"
                                onChange={e => setField("country", e.target.value)} />
                        </div>
                        <div>
                            <FieldLabel>Cidade / destino principal</FieldLabel>
                            <Input className="bg-background/40 h-11" placeholder="Ex: Lisboa, Cancún..." value={data.city}
                                autoComplete="address-level2"
                                onChange={e => setField("city", e.target.value)} />
                        </div>
                    </div>
                    <div>
                        <FieldLabel>A viagem terá mais de um destino?</FieldLabel>
                        <Select value={data.multipleDestinations} onValueChange={v => setField("multipleDestinations", v || "")}>
                            <SelectTrigger className="bg-background/40 h-11">
                                <SelectValue placeholder="Selecione..." />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Não">Não</SelectItem>
                                <SelectItem value="Sim">Sim</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    {data.multipleDestinations === "Sim" && (
                        <div>
                            <FieldLabel>Quais outros destinos?</FieldLabel>
                            <Textarea className="bg-background/40" placeholder="Liste os destinos adicionais..." value={data.extraDestinations}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setField("extraDestinations", e.target.value)} />
                        </div>
                    )}

                    {/* Q3 - Timeframe */}
                    <SectionLabel>Quando pretende fazer essa viagem?</SectionLabel>
                    <Select value={data.timeframe} onValueChange={v => setField("timeframe", v || "")}>
                        <SelectTrigger className="bg-background/40 h-11">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            {TIMEFRAMES.map(t => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {showDates && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <FieldLabel>Data de ida <span className="text-[10px] normal-case lowercase text-muted-foreground ml-1">(ou aproximada)</span></FieldLabel>
                                <Input type="date" className="bg-background/40 h-11" value={data.plannedDepartureDate}
                                    onChange={e => setField("plannedDepartureDate", e.target.value)} />
                            </div>
                            <div>
                                <FieldLabel>Data de volta <span className="text-[10px] normal-case lowercase text-muted-foreground ml-1">(ou aproximada)</span></FieldLabel>
                                <Input type="date" className="bg-background/40 h-11" value={data.plannedReturnDate}
                                    onChange={e => setField("plannedReturnDate", e.target.value)} />
                            </div>
                        </div>
                    )}

                    {/* Q4 - Travelers */}
                    <SectionLabel>Quantas pessoas irão viajar?</SectionLabel>
                    <div className="grid grid-cols-3 gap-3">
                        {(["adults", "children", "babies"] as const).map((key, i) => (
                            <div key={key}>
                                <FieldLabel>{["Adultos", "Crianças", "Bebês"][i]}</FieldLabel>
                                <Input type="number" min="0" className="bg-background/40 h-11" value={data[key]}
                                    onChange={e => setField(key, e.target.value)} />
                            </div>
                        ))}
                    </div>

                    {/* Q5 - Reason */}
                    <SectionLabel>Qual o motivo da viagem?</SectionLabel>
                    <Select value={data.travelReason} onValueChange={v => setField("travelReason", v || "")}>
                        <SelectTrigger className="bg-background/40 h-11">
                            <SelectValue placeholder="Selecione o motivo..." />
                        </SelectTrigger>
                        <SelectContent>
                            {TRAVEL_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                        </SelectContent>
                    </Select>
                    {data.travelReason === "Outro" && (
                        <div>
                            <FieldLabel>Qual o motivo da viagem?</FieldLabel>
                            <Input className="bg-background/40 h-11" placeholder="Descreva o motivo..." value={data.travelReasonOther}
                                onChange={e => setField("travelReasonOther", e.target.value)} />
                        </div>
                    )}

                    {/* Q6 - Services planned */}
                    <SectionLabel>Quais serviços você pretende incluir?</SectionLabel>
                    <div className="quadrant-grid">
                        {SERVICE_GROUPS.map(group => (
                            <div key={group.label} className="quadrant-item">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">{group.label}</p>
                                <div className="space-y-2">
                                    {group.items.map(item => {
                                        const displayName = item.includes(" - ") ? "Outro" : item
                                        return (
                                            <label key={item} className="flex items-center gap-2 cursor-pointer text-xs group/item">
                                                <Checkbox
                                                    checked={data.plannedServices.includes(item)}
                                                    onCheckedChange={() => toggleService(item)}
                                                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                />
                                                <span className="group-hover/item:text-primary transition-colors">{displayName}</span>
                                            </label>
                                        )
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>
                    {data.plannedServices.some(s => s.includes(" - Outro")) && (
                        <div>
                            <FieldLabel>Qual serviço você deseja?</FieldLabel>
                            <Input className="bg-background/40 h-11" placeholder="Descreva os serviços desejados..." value={data.plannedServicesOther}
                                onChange={e => setField("plannedServicesOther", e.target.value)} />
                        </div>
                    )}

                    {/* Q7 - Budget */}
                    <SectionLabel>Orçamento estimado</SectionLabel>
                    <Select value={data.budget} onValueChange={v => setField("budget", v || "")}>
                        <SelectTrigger className="bg-background/40 h-11">
                            <SelectValue placeholder="Selecione o orçamento..." />
                        </SelectTrigger>
                        <SelectContent>
                            {BUDGETS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                        </SelectContent>
                    </Select>

                    {/* Q8 - Team help */}
                    <SectionLabel>Gostaria que nossa equipe ajudasse a planejar?</SectionLabel>
                    <Select value={data.teamHelp} onValueChange={v => setField("teamHelp", v || "")}>
                        <SelectTrigger className="bg-background/40 h-11">
                            <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Sim">Sim</SelectItem>
                            <SelectItem value="Não">Não</SelectItem>
                        </SelectContent>
                    </Select>
                    {data.teamHelp === "Sim" && (
                        <div>
                            <FieldLabel>Conte um pouco mais sobre a viagem ou o que você precisa</FieldLabel>
                            <Textarea className="bg-background/40" placeholder="Fique à vontade para detalhar..." value={data.teamHelpNotes}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setField("teamHelpNotes", e.target.value)} />
                        </div>
                    )}
                </motion.div>
            )}

            <div className="flex flex-col md:flex-row items-center justify-center gap-4 mt-8 pt-6 pb-16 border-t border-border/10 relative w-full overflow-visible">
                <Button
                    type="button"
                    variant="ghost"
                    onClick={onBack}
                    className="md:absolute left-0 text-muted-foreground hover:text-foreground w-full md:w-auto h-11 px-6 z-10"
                >
                    Voltar
                </Button>

                <div className="relative group w-full md:w-auto flex justify-center overflow-visible">
                    {/* Glow effect that won't be clipped easily */}
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/0 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.98 }}
                        initial={false}
                        className="relative w-full md:w-auto"
                    >
                        <Button
                            type="button"
                            onClick={() => onSubmit(data)}
                            disabled={!data.hasPlannedTrip || isSubmitting}
                            className={`
                                w-full md:w-auto text-sm px-10 h-12 gap-2 font-black uppercase tracking-tight 
                                shadow-lg transition-all duration-300
                                bg-[#e34248] dark:bg-primary/90 
                                hover:bg-[#ff5d64] dark:hover:bg-primary 
                                text-white dark:text-primary-foreground
                                ring-2 ring-[#e34248]/20 dark:ring-primary/20
                                hover:ring-[#e34248]/40 dark:hover:ring-primary/40
                                hover:shadow-[0_0_30px_rgba(227,66,72,0.4)] dark:hover:shadow-[0_0_30px_rgba(34,197,94,0.3)]
                                rounded-xl
                            `}
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="animate-pulse">Enviando...</span>
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin ml-2" />
                                </>
                            ) : (
                                <>
                                    Enviar para Gestão <Send className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    )
}

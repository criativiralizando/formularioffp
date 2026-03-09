"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
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
import { ChevronRight, ChevronLeft, Plus, Trash2, Plane } from "lucide-react"

export interface TripData {
    departureDate: string
    returnDate: string
    country: string
    city: string
    multipleDestinations: string
    extraDestinations: string
    adults: string
    children: string
    babies: string
    travelReason: string
    travelReasonOther: string
    services: string[]
    unreservedServices: string[]
    unreservedOther: string
    budget: string
    teamOptimize: string
    travelNotes: string
}

export interface TravelIssuedData {
    hasIssuedTrips: string
    trips: TripData[]
}

const defaultTrip: TripData = {
    departureDate: "", returnDate: "", country: "", city: "",
    multipleDestinations: "", extraDestinations: "", adults: "", children: "", babies: "",
    travelReason: "", travelReasonOther: "", services: [], unreservedServices: [],
    unreservedOther: "", budget: "", teamOptimize: "", travelNotes: ""
}

const SERVICE_GROUPS = [
    {
        label: "Transporte",
        items: ["Passagem aérea", "Trem", "Ônibus", "Cruzeiro", "Aluguel de carro", "Transfer aeroporto ↔ hotel", "Transporte - Outro"],
    },
    {
        label: "Hospedagem",
        items: ["Hotel", "Resort", "Hostel", "Airbnb / Apartamento", "All Inclusive", "Hospedagem - Outro"],
    },
    {
        label: "Experiências",
        items: ["Ingresso de evento", "Shows / concertos", "Eventos esportivos", "Parques temáticos", "Passeios guiados", "Excursões / tours", "Experiências gastronômicas", "Experiências - Outro"],
    },
    {
        label: "Serviços de viagem",
        items: ["Seguro viagem", "Visto / documentação", "Chip de internet internacional", "Sala VIP de aeroporto", "Concierge de viagem", "Serviços - Outro"],
    },
]

const UNRESERVED_SERVICES = [
    "Passagem aérea", "Hotel", "Seguro viagem", "Transfer aeroporto",
    "Passeios no destino", "Ingressos de eventos", "Aluguel de carro",
    "Chip de internet internacional", "Planejamento completo da viagem", "Outro",
]

const TRAVEL_REASONS = ["Lazer", "Negócios", "Evento", "Lua de mel", "Família", "Estudo", "Compras", "Outro"]
const BUDGETS = ["Até R$ 5.000", "R$ 5.000 – R$ 10.000", "R$ 10.000 – R$ 25.000", "R$ 25.000 – R$ 50.000", "Acima de R$ 50.000"]

function SectionLabel({ children }: { children: React.ReactNode }) {
    return <p className="text-xs font-bold text-primary uppercase tracking-wider mt-4 mb-1">{children}</p>
}

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
    return (
        <Label className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider block mb-1">
            {children}{required && <span className="text-red-400 ml-0.5">*</span>}
        </Label>
    )
}

interface Props {
    initialData: TravelIssuedData
    onNext: (data: TravelIssuedData, skipToPage3: boolean) => void
    onBack: () => void
    isSubmitting: boolean
}

export function TravelIssuedForm({ initialData, onNext, onBack, isSubmitting }: Props) {
    const [data, setData] = useState<TravelIssuedData>(initialData)

    function setHasIssued(val: string) {
        setData(prev => ({ ...prev, hasIssuedTrips: val }))
    }

    function setTripField<K extends keyof TripData>(tripIndex: number, key: K, value: TripData[K]) {
        setData(prev => {
            const newTrips = [...prev.trips]
            newTrips[tripIndex] = { ...newTrips[tripIndex], [key]: value }
            return { ...prev, trips: newTrips }
        })
    }

    function toggleService(tripIndex: number, item: string) {
        setData(prev => {
            const newTrips = [...prev.trips]
            const currentServices = newTrips[tripIndex].services
            newTrips[tripIndex] = {
                ...newTrips[tripIndex],
                services: currentServices.includes(item)
                    ? currentServices.filter(s => s !== item)
                    : [...currentServices, item]
            }
            return { ...prev, trips: newTrips }
        })
    }

    function toggleUnreserved(tripIndex: number, item: string) {
        setData(prev => {
            const newTrips = [...prev.trips]
            const currentUnreserved = newTrips[tripIndex].unreservedServices
            newTrips[tripIndex] = {
                ...newTrips[tripIndex],
                unreservedServices: currentUnreserved.includes(item)
                    ? currentUnreserved.filter(s => s !== item)
                    : [...currentUnreserved, item]
            }
            return { ...prev, trips: newTrips }
        })
    }

    function addTrip() {
        if (data.trips.length < 5) {
            setData(prev => ({ ...prev, trips: [...prev.trips, { ...defaultTrip }] }))
        }
    }

    function removeTrip(index: number) {
        setData(prev => ({ ...prev, trips: prev.trips.filter((_, i) => i !== index) }))
    }

    function handleSubmit() {
        if (!data.hasIssuedTrips) return
        const skipToPage3 = data.hasIssuedTrips === "Não"
        onNext(data, skipToPage3)
    }

    const hasTrips = data.hasIssuedTrips === "Sim"

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
        >
            {/* Q1 - has issued trips */}
            <SectionLabel>Você já está com alguma viagem emitida neste momento?</SectionLabel>
            <Select value={data.hasIssuedTrips} onValueChange={v => setHasIssued(v || "")}>
                <SelectTrigger className="bg-background/40 h-11 text-sm">
                    <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="Sim">Sim</SelectItem>
                    <SelectItem value="Não">Não</SelectItem>
                </SelectContent>
            </Select>

            {hasTrips && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
                    <AnimatePresence mode="popLayout">
                        {data.trips.map((trip, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="relative p-4 rounded-xl border border-primary/10 bg-primary/[0.02] space-y-4 shadow-sm"
                            >
                                <div className="flex items-center justify-between border-b border-primary/5 pb-2">
                                    <h3 className="text-xs font-bold text-primary uppercase tracking-[0.2em] flex items-center gap-2">
                                        <Plane className="w-3 h-3" />
                                        Viagem {index + 1}
                                    </h3>
                                    {data.trips.length > 1 && (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                                            onClick={() => removeTrip(index)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    )}
                                </div>

                                {/* Q2 - Dates */}
                                <SectionLabel>Datas da viagem</SectionLabel>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <FieldLabel>Data de ida <span className="text-[10px] font-normal lowercase tracking-normal">(ou aproximada)</span></FieldLabel>
                                        <Input type="date" className="bg-background/40 h-11" value={trip.departureDate}
                                            onChange={e => setTripField(index, "departureDate", e.target.value)} />
                                    </div>
                                    <div>
                                        <FieldLabel>Data de volta <span className="text-[10px] font-normal lowercase tracking-normal">(ou aproximada)</span></FieldLabel>
                                        <Input type="date" className="bg-background/40 h-11" value={trip.returnDate}
                                            onChange={e => setTripField(index, "returnDate", e.target.value)} />
                                    </div>
                                </div>

                                {/* Q3 - Destination */}
                                <SectionLabel>Destino da viagem</SectionLabel>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div>
                                        <FieldLabel>País</FieldLabel>
                                        <Input className="bg-background/40 h-11" placeholder="Ex: Brasil, Portugal..." value={trip.country}
                                            onChange={e => setTripField(index, "country", e.target.value)} />
                                    </div>
                                    <div>
                                        <FieldLabel>Cidade / destino principal</FieldLabel>
                                        <Input className="bg-background/40 h-11" placeholder="Ex: Lisboa, Cancún..." value={trip.city}
                                            onChange={e => setTripField(index, "city", e.target.value)} />
                                    </div>
                                </div>
                                <div>
                                    <FieldLabel>A viagem possui múltiplos destinos?</FieldLabel>
                                    <Select value={trip.multipleDestinations} onValueChange={v => setTripField(index, "multipleDestinations", v || "")}>
                                        <SelectTrigger className="bg-background/40 h-11 text-xs">
                                            <SelectValue placeholder="Selecione..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Não">Não</SelectItem>
                                            <SelectItem value="Sim">Sim</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {trip.multipleDestinations === "Sim" && (
                                    <div>
                                        <FieldLabel>Quais cidades ou destinos adicionais?</FieldLabel>
                                        <Textarea className="bg-background/40 text-xs" placeholder="Liste os destinos adicionais..." value={trip.extraDestinations}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTripField(index, "extraDestinations", e.target.value)} />
                                    </div>
                                )}

                                {/* Q4 - Travelers */}
                                <SectionLabel>Quantidade de viajantes</SectionLabel>
                                <div className="grid grid-cols-3 gap-3">
                                    {(["adults", "children", "babies"] as const).map((key, i) => (
                                        <div key={key}>
                                            <FieldLabel>{["Adultos", "Crianças", "Bebês"][i]}</FieldLabel>
                                            <Input type="number" min="0" className="bg-background/40 h-11 text-xs" value={trip[key]}
                                                onChange={e => setTripField(index, key, e.target.value)} />
                                        </div>
                                    ))}
                                </div>

                                {/* Q5 - Travel reason */}
                                <SectionLabel>Motivo principal da viagem</SectionLabel>
                                <Select value={trip.travelReason} onValueChange={v => setTripField(index, "travelReason", v || "")}>
                                    <SelectTrigger className="bg-background/40 h-11 text-xs">
                                        <SelectValue placeholder="Selecione o motivo..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {TRAVEL_REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                                {trip.travelReason === "Outro" && (
                                    <div className="pt-2">
                                        <FieldLabel>Qual o motivo da viagem?</FieldLabel>
                                        <Input className="bg-background/40 h-11 text-xs" placeholder="Descreva o motivo..." value={trip.travelReasonOther}
                                            onChange={e => setTripField(index, "travelReasonOther", e.target.value)} />
                                    </div>
                                )}

                                {/* Q6 - Services */}
                                <SectionLabel>Serviços que fazem parte da viagem</SectionLabel>
                                <div className="space-y-3">
                                    {SERVICE_GROUPS.map(group => (
                                        <div key={group.label}>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-1">{group.label}</p>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1.5">
                                                {group.items.map(item => {
                                                    const displayName = item.includes(" - ") ? "Outro" : item
                                                    return (
                                                        <label key={item} className="flex items-center gap-2 cursor-pointer text-xs">
                                                            <Checkbox
                                                                checked={trip.services.includes(item)}
                                                                onCheckedChange={() => toggleService(index, item)}
                                                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                                            />
                                                            {displayName}
                                                        </label>
                                                    )
                                                })}
                                            </div>
                                            {trip.services.includes(`${group.label} - Outro`) && (
                                                <div className="mt-1.5">
                                                    <Input
                                                        className="bg-background/40 h-9 text-xs"
                                                        placeholder={`Outro serviço de ${group.label}...`}
                                                    /* You would ideally bind this to a specialized state if they are all unique,
                                                       but keeping it simple, they can type here, though this isn't strictly bound 
                                                       in the data model explicitly per 'outro' group beyond being a single string or just unmanaged.
                                                       Since original code didn't bind it, I am also leaving it purely aesthetic, 
                                                       or we can bind it to travelNotes later if needed */
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {/* Q7 - Unreserved */}
                                <SectionLabel>Serviços que ainda NÃO reservou</SectionLabel>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-1.5">
                                    {UNRESERVED_SERVICES.map(item => (
                                        <label key={item} className="flex items-center gap-2 cursor-pointer text-xs">
                                            <Checkbox
                                                checked={trip.unreservedServices.includes(item)}
                                                onCheckedChange={() => toggleUnreserved(index, item)}
                                                className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                                            />
                                            {item}
                                        </label>
                                    ))}
                                </div>
                                {trip.unreservedServices.includes("Outro") && (
                                    <div className="pt-2">
                                        <FieldLabel>Qual serviço você precisa?</FieldLabel>
                                        <Input className="bg-background/40 h-11 text-xs" placeholder="Descreva o serviço..." value={trip.unreservedOther}
                                            onChange={e => setTripField(index, "unreservedOther", e.target.value)} />
                                    </div>
                                )}

                                {/* Q8 - Budget */}
                                <SectionLabel>Orçamento estimado da viagem</SectionLabel>
                                <Select value={trip.budget} onValueChange={v => setTripField(index, "budget", v || "")}>
                                    <SelectTrigger className="bg-background/40 h-11 text-xs">
                                        <SelectValue placeholder="Selecione o orçamento..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {BUDGETS.map(b => <SelectItem key={b} value={b}>{b}</SelectItem>)}
                                    </SelectContent>
                                </Select>

                                {/* Q9 - Optimization */}
                                <SectionLabel>Otimização pela equipe</SectionLabel>
                                <FieldLabel>Gostaria que nossa equipe analisasse sua viagem para otimizar custos ou benefícios?</FieldLabel>
                                <Select value={trip.teamOptimize} onValueChange={v => setTripField(index, "teamOptimize", v || "")}>
                                    <SelectTrigger className="bg-background/40 h-11 text-xs">
                                        <SelectValue placeholder="Selecione..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Sim">Sim</SelectItem>
                                        <SelectItem value="Não">Não</SelectItem>
                                    </SelectContent>
                                </Select>
                                {trip.teamOptimize === "Sim" && (
                                    <div className="pt-2">
                                        <FieldLabel>Observações sobre a viagem</FieldLabel>
                                        <Textarea className="bg-background/40 text-xs" placeholder="Conta um pouco mais sobre a viagem..." value={trip.travelNotes}
                                            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setTripField(index, "travelNotes", e.target.value)} />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {data.trips.length < 5 && (
                        <div className="flex justify-center pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                className="h-10 px-8 border-dashed border-primary/30 hover:border-primary/60 dark:text-white dark:hover:text-[#22c55e] text-slate-900 hover:text-[#e34248] transition-all rounded-lg font-bold text-xs gap-2 bg-transparent hover:bg-transparent"
                                onClick={addTrip}
                            >
                                <Plus className="w-4 h-4" />
                                ADICIONAR OUTRA VIAGEM
                            </Button>
                        </div>
                    )}
                </motion.div>
            )}

            <div className="flex justify-between items-center mt-8 pt-4 border-t border-primary/10">
                <Button
                    type="button"
                    onClick={onBack}
                    variant="ghost"
                    className="text-sm px-6 gap-2 text-muted-foreground hover:text-foreground"
                >
                    <ChevronLeft className="w-4 h-4" /> Voltar
                </Button>
                <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!data.hasIssuedTrips || isSubmitting}
                    variant="outline"
                    className="text-sm px-6 gap-2 border-border hover:bg-accent"
                >
                    Próximo 2/3 <ChevronRight className="w-4 h-4" />
                </Button>
            </div>
        </motion.div>
    )
}

export const CARD_NAMES = [
    "Ourocard Fácil",
    "Ourocard Platinum",
    "Ourocard Altus",
    "Ourocard Elo Diners Club",
    "Ourocard Mastercard Black",
    "Smiles Visa Infinite",
    "Itaú Free",
    "Itaú Uniclass Signature",
    "Azul Itaú Infinite",
    "LATAM Pass Itaú Infinite",
    "LATAM Pass Itaú Black",
    "Pão de Açúcar Mastercard Black",
    "Personnalité Visa Infinite",
    "Personnalité Mastercard Black",
    "The One Mastercard Black",
    "Private Infinite Privilege",
    "Bradesco Neo",
    "Bradesco Signature",
    "Bradesco Prime Visa Infinite",
    "Bradesco Prime Mastercard Black",
    "Elo Diners Club Nanquim",
    "American Express Platinum",
    "American Express Centurion",
    "Bradesco Horizon Infinite",
    "Santander Free",
    "Santander Elite",
    "Santander Unique Visa Infinite",
    "Santander Unique Mastercard Black",
    "Santander Unlimited Visa Infinite",
    "Santander Unlimited Mastercard Black",
    "AAdvantage Mastercard Black",
    "Nubank Gold",
    "Nubank Platinum",
    "Nubank Ultravioleta",
    "Inter Gold",
    "Inter Platinum",
    "Inter Black",
    "Inter Win",
    "C6 Platinum",
    "C6 Black",
    "C6 Carbon",
    "BTG Pactual Black",
    "BTG Ultrablue",
    "XP Visa Infinite One",
    "XP Visa Infinite",
    "Porto Bank Visa Infinite",
    "Porto Bank Mastercard Black",
    "BRB Dux Visa Infinite",
    "BRB Dux Eurobike Mastercard Black",
    "Caixa Sim",
    "Caixa Elo Diners Club Nanquim",
    "Caixa Visa Infinite"
];

export function getFormattedCardName(bank?: string, card?: string): string {
    if (!card) return "Nome do Cartão";

    // Se o usuário digitou um nome customizado no "Outro"
    if (card === "Outro" || !CARD_NAMES.includes(card)) {
        return card;
    }

    return card;
}

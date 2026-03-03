import React from "react";

export default class DealerHand extends React.Component{
    static cards = []

    static addCard(card, isHidden) {
        this.cards.push({card: card, isHidden: isHidden})
    }

    static resetCards(){
        this.cards = []
    }

    static getScore() {
        let score = 0
        let aces = 0

        this.cards.forEach(c => {
            if(!c.isHidden){
                if (c.card.value === 11) {
                    aces++
                    score += 11
                } else {
                    score += c.card.value
                }
            }

        })

        // Tant que le score dépasse 21, on convertit les As (11 -> 1)
        while (score > 21 && aces > 0) {
            score -= 10
            aces--
        }

        return score
    }
}
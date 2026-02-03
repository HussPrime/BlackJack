import React from "react";

export default class DealerHand extends React.Component{
    static cards = []

    static addCard(card, isHidden) {
        this.cards.push({card: card, isHidden: isHidden})
    }

    static resetCards(){
        this.cards = []
    }

    static getScore(){
        let score = 0
        let tmp = [...this.cards]
        tmp.sort((a, b) => a > b )
        tmp.forEach(c => {
            if(!c.isHidden){
                if(c.card.value == 11 && score + 11 > 21)
                    score += 1
                else 
                    score += c.card.value
            }
        })
        return score
    }
}
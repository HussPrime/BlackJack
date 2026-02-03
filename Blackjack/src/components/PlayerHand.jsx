import React from "react";

export default class PlayerHand extends React.Component{
    static cards = []

    static addCard(card) {
        this.cards.push(card)
    }

    static resetCards(){
        this.cards = []
    }

    static getScore(){
        let score = 0
        this.cards.forEach(c => {
            if(c.value == 11 && score + 11 > 21)
                score += 1
            else 
                score += c.value
        })
        return score
    }
}
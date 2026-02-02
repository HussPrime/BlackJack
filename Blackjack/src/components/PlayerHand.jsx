import React from "react";
import Card_Deck from "./Card_deck"

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
            score += c.value
        })
        return score
    }
}
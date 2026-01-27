import React from "react";
import Card_Deck from "../../public/card_deck/Card_deck"

export default class PlayerHand extends React.Component{
    static cards = []

    static addCard(card) {
        this.cards.push(card)
    }

    static resetCards(){
        this.cards = []
    }
}
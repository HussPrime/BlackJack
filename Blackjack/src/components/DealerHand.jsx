import React from "react";
import Card_Deck from "../../public/card_deck/Card_deck"

export default class DealerHand extends React.Component{
    static cards = []

    static addCard(card, isHidden) {
        this.cards.push({card: card, isHidden: isHidden})
    }

    static resetCards(){
        this.cards = []
    }
}
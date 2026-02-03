import React from "react";
import { cards } from "../data/cardsData";

export default class Cards extends React.Component{
    static cards = []

    static setCards() {
        this.cards = [...cards];
    }

    static getRandomCard(){
        const index = Math.floor(Math.random() * this.cards.length);
        const card = this.cards[index];
        this.cards.splice(index, 1);
        return card;
    }
}
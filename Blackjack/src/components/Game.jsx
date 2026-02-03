import React from "react";
import DealerHand from "./DealerHand";
import PlayerHand from "./PlayerHand";
import Cards from "./Cards";

export default class Game extends React.Component{
    static initGame(){
        console.log("init Game")
        DealerHand.resetCards()
        PlayerHand.resetCards()

        PlayerHand.addCard(Cards.getRandomCard())
        PlayerHand.addCard(Cards.getRandomCard())

        DealerHand.addCard(Cards.getRandomCard(), false)
        DealerHand.addCard(Cards.getRandomCard(), true)
    }
}
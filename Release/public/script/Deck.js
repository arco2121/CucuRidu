class Card
{
    constructor(value,index,space)
    {
        this.value = value
        this.index = index
        this.space = space
    }

    toHTML(title,shownumber,answer,img)
    {
        const card = document.createElement("div")
        card.classList.add("card")
        if(answer == true && answer != null)
        {
            card.classList.add("reversecard")
        }
        const div = document.createElement("div")
        div.classList.add("semi")
        const text = document.createElement("h3")
        text.innerText = this.value.includes("#nomino") ? this.value.includes("#nomino", getRandomNamea()) : this.value;
        text.style.textAlign = "left"
        text.classList.add("quest")
        const space = document.createElement("h3")
        space.classList.add("spaces")
        const div1 = document.createElement("div")
        div1.classList.add("semi")
        space.innerText = this.space
        const tit = document.createElement("h4")
        const div2 = document.createElement("div")
        div2.classList.add("semi")
        div2.style.alignItems = "flex-end"
        div2.appendChild(space)
        tit.innerText = title
        div1.appendChild(tit)
        card.appendChild(div1)
        div.appendChild(text)
        card.appendChild(div)
        if(shownumber != true && shownumber == null)
        {
            card.appendChild(div2)
        }
        if(img != null)
        {
            card.style.backgroundImage = "url('" + img + "');"
            card.style.backgroundPosition = "center"
            card.style.backgroundSize = "cover";
            card.classList.add("overlay");
        }
        this.spacehtml = space
        this.text = text
        return card
    }

    toJSON()
    {
      return {
        value : value,
        index : index,
        space : space
      }
    }

    static FromJSON(json)
    {
        return new Card(json.value,json.index,json.space) || null 
    }
}
class Deck
{
    constructor(arr)
    {
        this.cards = arr || []
    }
    
    Shuffle()
    {
        this.cards.sort(() => Math.random() - 0.5)
        this.cards.forEach((e,i) => {
            this.cards[i].index = i
        })
    }

    Pick(nCards)
    {
        if(this.cards.length - nCards <= 0)
        {
            return null
        }
        let toReturn = []
        let n = 0
        while(n < nCards)
        {
            toReturn.push(this.cards.pop())
            n++
        }
        
        return toReturn
    }

    PickAll()
    {   
        const u = this.cards
        this.cards = []
        return u
    }

    PickCard(index)
    {
        if(this.cards.length - index.length <= 0)
        {
            return null
        }
        let t = []
        for(let i = 0; i<index.length; i++)
        {
            t.push(this.cards[index[i]])
            this.cards[index[i]] = null
        }
        let tem = []
        let id = 0
        this.cards.forEach(value => {
            if(value != null)
            {
                tem.push(new Card(value.value,id,value.space))
                id++
            }
        })
        this.cards = tem
        return t
    }

    Insert(cards) 
    {
        let i = this.cards.length - 1
        let temp = []
        cards.forEach(value => {
            if(value != null)
            {
                temp.push(new Card(value.value,i,value.space))
                i++
            }
        })
        this.cards = this.cards.concat(temp)
        this.Shuffle()
    }

    toJSON()
    {
        return {
            cards : this.cards.map(card => card.toJSON())
        }
    }

    static fromJSON(data)
    {
        return new Deck(data.map(card => Card.FromJSON(card))) || null
    }
}
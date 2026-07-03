import React, { useState } from 'react'
import Board from '../components/Board'

const initialBoardData = [
    {
    id: 1,
    title: "To Do",
    cards:[
        {id:1 , title:"Learn React"},
        {id:2, title:"Learn Redux"}
    ]
    },
    {
        id:2,
        title:"Doing",
        cards:[
            {id:1, title:"Build Navbar"},
            {id:2, title:"Build Board"}
        ]
    },
    {
    id: 3,
    title: "Done",
    cards: [
      { id: 5, title: "Setup Project" },
    ],
  },
]
const Home = () => {
    const [lists, setlists] = useState(initialBoardData)
  return (
    <div>
        <Board lists={lists} setlists={setlists} />
    </div>
  )
}

export default Home
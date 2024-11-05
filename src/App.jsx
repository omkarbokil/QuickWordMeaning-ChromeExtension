import { useEffect, useState } from 'react'

function App() {

  let [antonyms, setAntonyms] = useState([]);
  let [synonyms, setSynonyms] = useState([]);
  let [definition, setDefinition] = useState('');
  let [partOfSpeech, setPartOfSpeech] = useState('');
  let [example, setExample] = useState([]);
  let [selectedText, setSelectedText] = useState('');
  let [phonetics, setPhonetics] = useState('');
  let [loading, setLoading] = useState(false);
  let [mainLoading, setMainLoading] = useState(false);
  let [error, setError] = useState('');

  useEffect(() => {
    async function sayHello() {
      let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          console.log('Started');
        },
      });
    }
    sayHello();
  }, []);

  useEffect(() => {
  // Sending Message to server-worker.js to get response
    chrome.runtime.sendMessage({ type: 'GET_SELECTED_TEXT' }, (response) => {
      if (response && response.text) {
        setSelectedText(response.text);
      }
    });
  }, []);

  useEffect(() => {
    setExample([]);
    setSynonyms([]);
    setAntonyms([]);
    setPhonetics('')
    setDefinition('')
    setPartOfSpeech('')
    const fetchData = async () => {
        try {
            setMainLoading(true);
            const response = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${selectedText}`);
            let data = await response.json();

            if(response.status !== 200){
              setError(data.title);
              setMainLoading(false);
              return;
            }

            if(data){
              setMainLoading(false);
            }

            let meanings = data[0].meanings;
            let phonetics = data[0].phonetics;

            let audio = phonetics.find((element) => element.audio)?.audio;

            if(audio){
              setPhonetics(audio);
            }

            meanings.map((element, index) => {
              // Definition
              if(index === 0){
                setPartOfSpeech(element.partOfSpeech);
                setDefinition(element.definitions[0].definition);
              }
              // Antonyms
              if(element.antonyms.length > 0){
                setAntonyms(element.antonyms)
              }
              // Synonyms
              if(element.synonyms.length > 0){
                setSynonyms(element.synonyms)
              }

              let exampleArr = element.definitions;

              exampleArr.map((item) => {
                if(item.example){
                  setExample((prev) => {
                    return [...prev, item.example]
                  })
                }
              })
              
            })
            
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    if(selectedText){
      fetchData();
    }
  }, [selectedText]);

  let playaudio = () => {
    if(phonetics){
      setLoading(true);
      const audio = new Audio(phonetics);
      audio.play()
      .then(() => {
        setLoading(false);
      })
      .catch((error) => {
        setError('Please try again')
        setLoading(false);
      });
    }
  }

  return (
    <>
      <div className='text-white flex justify-center items-center p-5 w-[450px]'>
        <div>
          {
            selectedText ? (
              <div>
                {
                  mainLoading ? (
                    <div className='flex items-center gap-2'>
                    <span class="material-symbols-outlined animate-spin">
                      progress_activity
                    </span>
                    Loading
                  </div>
                  ) : (
                    <div>
                      <div className='flex items-center gap-3'>
                        <span className='text-xl capitalize'>
                          {
                            definition ? 
                            <div>
                              {selectedText}
                            </div>
                            :
                            <div>
                              {error} for <span className='italic'>{selectedText}</span>
                            </div>
                          }
                        </span>
                        <div>
                          {
                            phonetics !== '' ?
                            (
                              error ? (
                                <div className='text-sm text-neutral-400'>
                                  {error}
                                </div>
                              ) : (
                                <div>
                                  {
                                    loading ? 
                                    <span class="material-symbols-outlined animate-spin bg-white/10 p-2 rounded-full cursor-pointer text-[18px] hover:bg-blue-500 transition-all duration-300" onClick={playaudio}>
                                      progress_activity
                                    </span>
                                    :
                                    <span class="material-symbols-outlined bg-white/10 p-2 rounded-full cursor-pointer text-[18px] hover:bg-blue-500 transition-all duration-300" onClick={playaudio}>
                                      volume_up
                                    </span>
                                  }
                                </div>
                              )
                            )
                            : ''
                          }
                        </div>
                      </div>
                      <div className='my-3 text-[16px]'>
                        <div>
                          <span className='text-sm'>
                          {
                            partOfSpeech ? 
                              <div>{partOfSpeech} : </div> 
                             : ''
                          }
                          </span>
                        </div>
                        <p className='w-[400px]'>
                          {definition}
                        </p> 
                      </div>
                      {
                        example.length > 0 ? (
                          <div className='text-sm text-neutral-400 w-[400px]'>
                            Examples
                            {
                              example.map((item, index) => {
                                if(index <= 1){
                                  return (
                                    <>
                                      <div key={index}>
                                        {index+1}. {item}
                                      </div>
                                    </>
                                  )
                                }
                              })
                            }
                          </div>
                        ) : ''
                      }
                      {
                        <div className='mt-5 text-sm text-neutral-400 w-[400px]'>
                          {
                            synonyms.length > 0 ? (
                              <div className='flex gap-2 items-center flex-wrap'>
                                <p>Similar : </p>
                                {
                                  synonyms.map((item, index) => (
                                    index <= 2 ? (
                                      <div className='border border-neutral-600 text-neutral-300 px-4 py-1 rounded-full capitalize hover:bg-white/10 cursor-pointer' onClick={() => setSelectedText(item)}>
                                        {item}
                                      </div>
                                    ) : ''
                                  ))
                                }
                              </div>
                            ) : ''
                          }
                        </div>
                      }
                      {
                        <div className='mt-3 text-sm text-neutral-400 w-[400px]'>
                          {
                            antonyms.length > 0 ? (
                              <div className='flex gap-2 items-center flex-wrap'>
                                <p>Opposite : </p>
                                {
                                  antonyms.map((item, index) => (
                                    index <= 2 ? (
                                      <div className='border border-neutral-600 text-neutral-300 px-4 py-1 rounded-full capitalize hover:bg-white/10 cursor-pointer' onClick={() => setSelectedText(item)}>
                                        {item}
                                      </div>
                                    ) : ''
                                  ))
                                }
                              </div>
                            ) : ''
                          }
                        </div>
                      }
                    </div>
                  )
                }
              </div>
            ) : 'Double click on a word to see details'
          }
        </div>
      </div>
    </>
  )
}

export default App

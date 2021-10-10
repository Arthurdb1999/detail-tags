import React, { FormEvent, useEffect, useState } from 'react';
import api from './services/api';
import './styles/app.css'

interface MachineTags {
    id: number;
    machine_tag: string;
    name: string;
    tags: Tag[]
}

interface Suffix {
    id: number;
    suffix: string;
    description: string;
}

interface Preffix {
    id: number;
    preffix: string;
    description: string;
}

interface Tag {
    id: number;
    number: number;
    detail: string;
}

interface TagResponse {
    machine_tags: MachineTags[],
    suffixes: Suffix[],
    preffixes: Preffix[]
}

function App() {

    const [suffixes, setSuffixes] = useState<Suffix[]>([])
    const [preffixes, setPreffixes] = useState<Preffix[]>([])
    const [machineTags, setMachineTags] = useState<MachineTags[]>([])

    const [willaddPreffix, setWillAddPreffix] = useState(false)
    const [willaddSuffix, setWillAddSuffix] = useState(false)
    const [willaddMachine, setWillAddMachine] = useState(false)
    const [willaddTag, setWillAddTag] = useState(false)

    const [part, setPart] = useState('')
    const [description, setDescription] = useState('')
    const [selectedMachine, setSelectedMachine] = useState(0)

    useEffect(() => {
        async function getData() {
            const data = await api.get<TagResponse>('/tags')
            setSuffixes(data.data.suffixes)
            setPreffixes(data.data.preffixes)
            setMachineTags(data.data.machine_tags)
        }

        getData()
    }, [])

    function selectButton(part: string) {
        if (part === 'preffix') {
            setWillAddPreffix(true)
            setWillAddSuffix(false)
            setWillAddTag(false)
            setWillAddMachine(false)
        }
        if (part === 'suffix') {
            setWillAddPreffix(false)
            setWillAddSuffix(true)
            setWillAddTag(false)
            setWillAddMachine(false)
        }
        if (part === 'machine') {
            setWillAddPreffix(false)
            setWillAddSuffix(false)
            setWillAddTag(false)
            setWillAddMachine(true)
        }
        if (part === 'tag') {
            setWillAddPreffix(false)
            setWillAddSuffix(false)
            setWillAddTag(true)
            setWillAddMachine(false)
        }
    }
    
    async function sendData(e: FormEvent) {
        e.preventDefault()
        
        if (willaddSuffix === false && willaddTag === false && willaddMachine === false && willaddPreffix === false) return
        if (part === '' || description === '' || (willaddTag && selectedMachine === 0)) return
        if (willaddSuffix) {
            if (suffixes.filter(suffix => suffix.suffix === part).length > 0 ) return
        } else if (willaddPreffix) {
            if (preffixes.filter(preffix => preffix.preffix === part).length > 0 ) return
        } else if (willaddMachine) {
            if (machineTags.filter(mt => mt.machine_tag === part).length > 0 ) return
        } else {
            if (machineTags.filter(mt => mt.tags.filter(tag => tag.number === Number(part))).length > 0) return
        }
        const info = willaddMachine ? 'machine' : (willaddPreffix ? 'preffix' : (willaddSuffix ? 'suffix' : 'tag'))

        try {
            const response = await api.post<any>('/createTag', {
                info,
                part,
                description,
                machine: info === 'tag' ? selectedMachine : null
            })

            if (info === 'preffix') {
                setPreffixes([
                    ...preffixes,
                    {
                        id: response.data.id,
                        preffix: part,
                        description
                    }
                ])
            } else if (info === 'suffix') {
                setSuffixes([
                    ...suffixes,
                    {
                        id: response.data.id,
                        suffix: part,
                        description
                    }
                ])
            } else if (info === 'machine') {
                setMachineTags([
                    ...machineTags,
                    {
                        id: response.data.id,
                        machine_tag: part,
                        name: description,
                        tags: []
                    }
                ])
            } else {
                const machineTagToUpdate = machineTags.filter(mt => mt.id === selectedMachine)[0]
                const remainingMachineTags = machineTags.filter(mt => mt.id !== selectedMachine)
                machineTagToUpdate.tags = [
                    ...machineTagToUpdate.tags,
                    {
                        id: response.data.id,
                        number: Number(part),
                        detail: description
                    }
                ]
                setMachineTags([
                    ...remainingMachineTags, machineTagToUpdate
                ])
            }
        } catch (error) {
            console.error(error)
        }
    }

    return (
        <div>
            <div style={{
                'display': 'flex',
                'flexDirection': 'row',
                'justifyContent': 'space-evenly',
                'marginBottom': '48px'
            }}>
                <div style={{
                    'display': 'flex',
                    'flexDirection': 'column',
                }}>
                    <p>Uma tag é composta por 3 partes, prefixo, código e sufixo</p>
                    <span>Exemplo: VOC312999_fa</span>
                    <li>Prefixo: VOC</li>
                    <li>Código: 312999</li>
                    <li>Sufixo: fa</li>
                </div>
                <div style={{
                    'display': 'flex',
                    'flexDirection': 'column'
                }}>
                    <h3><strong>Adicionar Tag</strong></h3>
                    <div style={{
                        'display': 'flex',
                        'flexDirection': 'row',
                        'width': '400px'
                    }}>
                        <button
                            onClick={() => selectButton('preffix')}
                            className={willaddPreffix ? "selectedButton" : ''}
                        >
                            Prefixo
                        </button>

                        <button
                            onClick={() => selectButton('suffix')}
                            className={willaddSuffix ? "selectedButton" : ''}
                        >
                            Sufixo
                        </button>

                        <button
                            onClick={() => selectButton('machine')}
                            className={willaddMachine ? "selectedButton" : ''}
                        >
                            Equipamento
                        </button>

                        <button
                            onClick={() => selectButton('tag')}
                            className={willaddTag ? "selectedButton" : ''}
                        >
                            Tag
                        </button>
                    </div>
                    <div style={{
                        'display': 'flex',
                        'flexDirection': 'column',
                        'width': '25%'
                    }}>
                        <form onSubmit={sendData}>

                            {willaddTag &&
                                <>
                                    <label><strong>Selecione a Máquina: </strong></label>
                                    <select
                                        value={selectedMachine}
                                        onChange={e => setSelectedMachine(Number(e.target.value))}
                                    >
                                        <option value={0} hidden disabled>Selecione uma opção</option>
                                        {machineTags.map(machine => (
                                            <option key={machine.id} value={machine.id}>{machine.name}</option>
                                        ))}
                                    </select>
                                </>
                            }
                            <label><strong>{willaddMachine ? 'Equipamento:' : (willaddPreffix ? 'Prefixo: ' : (willaddSuffix ? 'Sufixo: ' : 'Tag: '))}</strong></label>
                            <input
                                type="text"
                                value={part}
                                onChange={e => setPart(e.target.value)}
                            />
                            <label><strong>{willaddTag ? 'Detalhe: ' : 'Descrição: '}</strong></label>
                            <input
                                type="text"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                            />

                            <button type="submit">
                                Enviar
                            </button>
                        </form>
                    </div>
                </div>
            </div>
            <div style={{
                "display": 'flex',
                'flexDirection': 'row',
                'width': '100%',
                'justifyContent': 'space-evenly'
            }}>
                <table>
                    <thead>
                        <tr>
                            <th>Prefixo</th>
                            <th>Descrição</th>
                        </tr>
                    </thead>
                    <tbody>
                        {preffixes.map(preffix => (
                            <tr key={preffix.id}>
                                <td>{preffix.preffix}</td>
                                <td>{preffix.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <table>
                    <thead>
                        <tr>
                            <th>Sufixo</th>
                            <th>Descrição</th>
                        </tr>
                    </thead>
                    <tbody>
                        {suffixes.map(suffix => (
                            <tr key={suffix.id}>
                                <td>{suffix.suffix}</td>
                                <td>{suffix.description}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                <table>
                    <thead>
                        <tr>
                            <th>Equipamento</th>
                            <th>Tag do Equipamento</th>
                            <th>Códigos</th>
                        </tr>
                    </thead>
                    <tbody>
                        {machineTags.map(machine => (
                            <tr key={machine.id}>
                                <td>{machine.name}</td>
                                <td>{machine.machine_tag}</td>
                                {machine.tags[0] != null ? machine.tags.map(tag => (
                                    <td key={tag.id} style={{
                                        "display": 'flex',
                                        "flexDirection": 'column'
                                    }}>
                                        <strong>Tag: </strong>{tag.number}
                                        <strong>Detalhe: </strong>{tag.detail}
                                    </td>
                                )) : <td>Sem tags</td>}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default App;

import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Check, ChevronDown, CircleHelp, Plus, ShoppingBasket, Trash2, X } from 'lucide-react'

type Category = 'Овощи и фрукты' | 'Молочное' | 'Бакалея' | 'Другое'
type Item = { id: string; name: string; amount: string; category: Category; done: boolean }
type Filter = 'Все' | 'Купить' | 'В корзине'

const categories: Category[] = ['Овощи и фрукты', 'Молочное', 'Бакалея', 'Другое']
const initialItems: Item[] = [
  { id: '1', name: 'Авокадо', amount: '2 шт.', category: 'Овощи и фрукты', done: false },
  { id: '2', name: 'Молоко', amount: '1 л', category: 'Молочное', done: false },
  { id: '3', name: 'Хлеб на закваске', amount: '1 шт.', category: 'Бакалея', done: true },
  { id: '4', name: 'Черри', amount: '250 г', category: 'Овощи и фрукты', done: false },
]

function loadItems(): Item[] {
  try {
    const stored = localStorage.getItem('shopping-list-items')
    return stored ? JSON.parse(stored) as Item[] : initialItems
  } catch { return initialItems }
}

export default function App() {
  const [items, setItems] = useState<Item[]>(loadItems)
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('1 шт.')
  const [category, setCategory] = useState<Category>('Другое')
  const [filter, setFilter] = useState<Filter>('Все')

  useEffect(() => { localStorage.setItem('shopping-list-items', JSON.stringify(items)) }, [items])

  const remaining = items.filter((item) => !item.done).length
  const progress = items.length ? Math.round(((items.length - remaining) / items.length) * 100) : 0
  const visibleItems = useMemo(() => items.filter((item) => filter === 'Все' || (filter === 'Купить' ? !item.done : item.done)), [items, filter])
  const groups = categories.map((categoryName) => ({ category: categoryName, items: visibleItems.filter((item) => item.category === categoryName) })).filter((group) => group.items.length)

  function addItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const cleanName = name.trim()
    if (!cleanName) return
    setItems((current) => [{ id: crypto.randomUUID(), name: cleanName, amount: amount.trim() || '1 шт.', category, done: false }, ...current])
    setName('')
  }

  function toggleItem(id: string) { setItems((current) => current.map((item) => item.id === id ? { ...item, done: !item.done } : item)) }
  function deleteItem(id: string) { setItems((current) => current.filter((item) => item.id !== id)) }
  function clearDone() { setItems((current) => current.filter((item) => !item.done)) }

  return (
    <main className="page-shell">
      <header className="topbar"><a className="brand" href="#top"><span className="brand-mark"><ShoppingBasket size={19} strokeWidth={2.2} /></span><span>лист<span className="brand-dot">.</span></span></a><span className="top-note"><span className="live-dot" />Ваш маленький план на сегодня</span></header>
      <section className="content" id="top">
        <div className="intro"><p className="eyebrow">СПОКОЙНО. ПО ПУНКТАМ.</p><h1>Список покупок<span className="title-period">.</span></h1><p className="subtitle">Всё нужное — в одном месте. Ничего лишнего.</p></div>

        <section className="progress-card" aria-label="Прогресс списка">
          <div className="progress-copy"><div><span className="progress-label">ВАШ ПРОГРЕСС</span><p>{remaining === 0 && items.length > 0 ? 'Всё куплено — отличный план!' : <>Осталось купить <strong>{remaining} {remaining === 1 ? 'покупку' : remaining > 1 && remaining < 5 ? 'покупки' : 'покупок'}</strong></>}</p></div><span className="progress-count">{items.length - remaining}<span> / {items.length}</span></span></div>
          <div className="progress-track"><span style={{ width: `${progress}%` }} /></div>
        </section>

        <section className="add-card"><div className="section-heading"><div><span className="step-number">01</span><h2>Добавить в список</h2></div><span className="optional-note">Это займёт секунду</span></div>
          <form onSubmit={addItem} className="add-form">
            <label className="field name-field"><span>Что купить?</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Например, спелые персики" aria-label="Название покупки" /></label>
            <label className="field amount-field"><span>Количество</span><input value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="1 шт." aria-label="Количество" /></label>
            <label className="field category-field"><span>Категория</span><span className="select-wrap"><select value={category} onChange={(event) => setCategory(event.target.value as Category)} aria-label="Категория">{categories.map((value) => <option key={value}>{value}</option>)}</select><ChevronDown size={15} /></span></label>
            <button className="add-button" type="submit" aria-label="Добавить покупку"><Plus size={19} /><span>Добавить</span></button>
          </form>
        </section>

        <section className="list-section"><div className="list-heading"><div><span className="step-number">02</span><h2>Ваш список</h2><span className="item-total">{items.length}</span></div><div className="list-tools"><div className="filters" role="tablist" aria-label="Фильтр покупок">{(['Все', 'Купить', 'В корзине'] as Filter[]).map((value) => <button key={value} type="button" role="tab" aria-selected={filter === value} className={filter === value ? 'filter active' : 'filter'} onClick={() => setFilter(value)}>{value}</button>)}</div>{items.some((item) => item.done) && <button className="clear-button" onClick={clearDone} type="button">Очистить купленное</button>}</div></div>
          <div className="shopping-list">
            {groups.length ? groups.map((group) => <div className="category-group" key={group.category}><div className="category-title"><span className={`category-dot dot-${categories.indexOf(group.category)}`} />{group.category}<span className="category-line" /><span className="category-count">{group.items.length}</span></div><div className="items">{group.items.map((item) => <article className={item.done ? 'item-row is-done' : 'item-row'} key={item.id}><button className="check-button" type="button" aria-label={item.done ? `Отметить ${item.name} как некупленное` : `Отметить ${item.name} купленным`} onClick={() => toggleItem(item.id)}>{item.done && <Check size={14} strokeWidth={2.5} />}</button><span className="item-name">{item.name}</span><span className="item-amount">{item.amount}</span><button className="delete-button" type="button" aria-label={`Удалить ${item.name}`} onClick={() => deleteItem(item.id)}><Trash2 size={16} /></button></article>)}</div></div>) : <div className="empty-state"><span className="empty-icon"><ShoppingBasket size={22} /></span><p>{items.length ? 'В этой вкладке пока пусто.' : 'Список пока пуст.'}</p><span>{items.length ? 'Выберите другой фильтр или добавьте покупку.' : 'Добавьте первую покупку выше — и можно отправляться.'}</span></div>}
          </div>
        </section>
        <footer className="footer"><span><CircleHelp size={14} /> Список сохраняется на этом устройстве</span>{items.length > 0 && <button type="button" className="reset-button" onClick={() => { if (window.confirm('Удалить все покупки из списка?')) setItems([]) }}><X size={13} />Начать заново</button>}</footer>
      </section>
      <div className="page-decoration decoration-one" /><div className="page-decoration decoration-two" />
    </main>
  )
}

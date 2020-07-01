import React, { useState, useEffect, FormEvent } from 'react';

import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';

import formatValue from '../../utils/formatValue';

import { Container, CardContainer, Card, Form, TableContainer } from './styles';

interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  category: { title: string };
  created_at: Date;
}

interface Balance {
  income: string;
  outcome: string;
  total: string;
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState<Balance>({} as Balance);

  const [titleForm, setTitleForm] = useState('');
  const [valueForm, setValueForm] = useState('');
  const [typeForm, setTypeForm] = useState('');
  const [categoryForm, setCategoryForm] = useState('');

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      const response = await api.get('/transactions');

      const formattedTransactions = response.data.transactions.map(
        (transaction: Transaction) => ({
          ...transaction,
          formattedValue: formatValue(transaction.value),
          formattedDate: new Date(transaction.created_at).toLocaleDateString(
            'pt-BR',
          ),
        }),
      );

      const formattedBalance = {
        income: formatValue(response.data.balance.income),
        outcome: formatValue(response.data.balance.outcome),
        total: formatValue(response.data.balance.total),
      };

      setTransactions(formattedTransactions);
      setBalance(formattedBalance);
    }

    loadTransactions();
  }, []);

  async function handleAddTransaction(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();

    const newTransaction = {
      title: titleForm,
      type: typeForm,
      value: Number(valueForm),
      category: categoryForm,
    };

    const response = await api.post('/transactions', newTransaction);
  }
  return (
    <>
      <Header />
      <Container>
        <CardContainer>
          <Card>
            <header>
              <p>Entradas</p>
              <img src={income} alt="Income" />
            </header>
            <h1 data-testid="balance-income">{balance.income}</h1>
          </Card>
          <Card>
            <header>
              <p>Saídas</p>
              <img src={outcome} alt="Outcome" />
            </header>
            <h1 data-testid="balance-outcome">{balance.outcome}</h1>
          </Card>
          <Card total>
            <header>
              <p>Total</p>
              <img src={total} alt="Total" />
            </header>
            <h1 data-testid="balance-total">{balance.total}</h1>
          </Card>
        </CardContainer>

        <Form onSubmit={handleAddTransaction}>
          <div>
            <label htmlFor="title">Título</label>
            <input
              type="text"
              id="title"
              required
              value={titleForm}
              onChange={e => setTitleForm(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="value">Valor</label>
            <input
              type="number"
              step="0.01"
              id="value"
              required
              value={valueForm}
              onChange={e => setValueForm(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="category">Categoria</label>
            <input
              type="text"
              id="category"
              required
              value={categoryForm}
              onChange={e => setCategoryForm(e.target.value)}
            />
          </div>

          <div>
            <label htmlFor="type">Tipo</label>
            <select
              name=""
              id="type"
              required
              value={valueForm}
              onChange={e => setTypeForm(e.target.value)}
            >
              <option value="income">Ganhos</option>
              <option value="outcome">Gastos</option>
            </select>
          </div>
          <button type="submit">SALVAR</button>
        </Form>

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td className="title">{transaction.title}</td>
                  <td className={transaction.type}>
                    {transaction.type === 'outcome' && ' - '}
                    {transaction.formattedValue}
                  </td>
                  <td>{transaction.category.title}</td>
                  <td>{transaction.formattedDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;

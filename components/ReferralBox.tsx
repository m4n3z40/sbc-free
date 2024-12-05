import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { ChevronDown, ChevronUp, Copy, Check } from 'lucide-react'
import { Button } from './ui/button'
import { Doughnut } from 'react-chartjs-2'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'

// Registre os elementos necessários
ChartJS.register(ArcElement, Tooltip, Legend)

interface Referral {
  name: string
  email: string
  createdAt: Date
}

export function ReferralBox() {
  const { data: session } = useSession()
  const [referrals, setReferrals] = useState<Referral[]>([])
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchReferrals()
    }
  }, [session])

  const fetchReferrals = async () => {
    try {
      const response = await fetch(`/api/referrals?userId=${session?.user?.id}`)
      const data = await response.json()
      setReferrals(data.referrals)
      setHasAccess(data.hasAccess)
    } catch (error) {
      console.error('Error fetching referrals:', error)
    }
  }

  const copyReferralLink = async () => {
    const referralLink = `${window.location.origin}?ref=${session?.user?.id}`
    await navigator.clipboard.writeText(referralLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const chartData = (target: number) => ({
    datasets: [
      {
        data: [Math.min(referrals.length, target), Math.max(target - referrals.length, 0)],
        backgroundColor: ['#10B981', '#374151'],
        borderWidth: 0,
      },
    ],
  })

  const chartOptions = {
    cutout: '80%',
    plugins: {
      tooltip: {
        enabled: false,
      },
    },
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg min-h-[500px]">
      <h3 className="text-xl font-bold text-gray-200 mb-4">
        Indique pessoas para a plataforma e ganhe acesso ao curso completo
      </h3>

      <div className="mb-4">
        <div className="flex items-center justify-between text-gray-300 mb-2">
          <span>{referrals.length} {referrals.length === 1 ? 'indicação' : 'indicações'}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="text-gray-400 hover:text-gray-200"
          >
            {isDropdownOpen ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>

        <div className="bg-gray-700 h-2 rounded-full mb-2">
          <div 
            className="bg-green-500 h-full rounded-full transition-all duration-500"
            style={{ width: `${Math.min((referrals.length / 40) * 100, 100)}%` }}
          />
        </div>
        
        <p className="text-sm text-gray-400">
          {hasAccess 
            ? "Parabéns! Você já tem acesso ao curso completo!" 
            : `Faltam ${Math.max(40 - referrals.length, 0)} indicações para liberar o acesso completo`}
        </p>
      </div>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden mb-4"
          >
            <div className="space-y-2">
              {referrals.map((referral, index) => (
                <div 
                  key={index}
                  className="bg-gray-700 p-2 rounded text-gray-300 text-sm"
                >
                  {referral.name}
                </div>
              ))}
              {referrals.length === 0 && (
                <p className="text-gray-400 text-sm">
                  Nenhuma indicação ainda
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Button
        onClick={copyReferralLink}
        className="w-full flex items-center justify-center gap-2"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4" />
            Link copiado!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4" />
            Copiar link de indicação
          </>
        )}
      </Button>

      <h3 className="text-l md:text-lg font-bold text-gray-200 mb-4 mt-8">
        Com 5 indicações, você já começa a ganhar:
      </h3>

      <div className="flex justify-around mt-6">
        <div className="w-24 h-24">
          <Doughnut data={chartData(5)} options={chartOptions} />
          <p className="text-center text-gray-300 text-xs mt-3"><strong className="text-sm">5 indicações</strong><br />🗄️ Módulo 4 - Banco de Dados</p>
        </div>
        <div className="w-24 h-24">
          <Doughnut data={chartData(15)} options={chartOptions} />
          <p className="text-center text-gray-300 text-xs mt-3"><strong className="text-sm">15 indicações</strong><br />💬 Mentoria com prof. Allan</p>
        </div>
        <div className="w-24 h-24">
          <Doughnut data={chartData(40)} options={chartOptions} />
          <p className="text-center text-gray-300 text-xs mt-3"><strong className="text-sm">40 indicações</strong><br />😎 Acesso Curso completo</p>
        </div>
      </div>


    </div>
  )
}
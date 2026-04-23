export default function Manual() {
  return (
    <div className="space-y-6 pb-10">
      <div className="bg-green-600 text-white rounded-xl p-5">
        <h1 className="text-xl font-bold">📖 操作マニュアル</h1>
        <p className="text-sm mt-1 text-green-100">三笠館 軒先販売管理システム</p>
      </div>

      {/* ① 契約者を追加する */}
      <Section num="①" title="新しい契約者を追加する">
        <Step n="1" text="まず、LINEのグループに「のきさきbot」を招待する" />
        <Step n="2" text="そのグループで誰かがメッセージを送る" />
        <Step n="3" text="画面上部の「📖 使い方」の隣にある設定ページ（/setup）を開くか、ブラウザで nokisaki.vercel.app/setup を開く" />
        <Step n="4" text="表示されたグループIDをコピーする（「未割り当て」と表示されているもの）" />
        <Step n="5" text="トップ画面の「＋ 契約者追加」をタップ" />
        <Step n="6" text="契約者名とコピーしたグループIDを入力して「登録する」" />
        <Note text="グループIDを設定しないとLINE通知が届きません" />
      </Section>

      {/* ② 商品を追加する */}
      <Section num="②" title="商品を追加する">
        <Step n="1" text="トップ画面から対象の契約者名をタップ" />
        <Step n="2" text="右上の「＋ 商品追加」をタップ" />
        <Step n="3" text="商品名・販売価格・初期在庫数を入力して「登録する」" />
        <Note text="在庫が2個以下になると赤く表示され、LINEに補充依頼が届きます" />
      </Section>

      {/* ③ 売れた時 */}
      <Section num="③" title="商品が売れた時">
        <Step n="1" text="トップ画面から対象の契約者名をタップ" />
        <Step n="2" text="売れた商品の左側の入力欄に個数を入力（1個の場合は空白でOK）" />
        <Step n="3" text="オレンジの「売れた！！」ボタンをタップ" />
        <Note text="在庫が自動で減り、契約者のLINEグループに通知が届きます" />
        <Note text="在庫が2個以下になると自動で補充お願いメッセージも届きます" />
      </Section>

      {/* ④ 補充してもらった時 */}
      <Section num="④" title="商品を補充してもらった時">
        <Step n="1" text="対象の契約者詳細画面を開く" />
        <Step n="2" text="補充してもらった商品の「📦補充」ボタン左の入力欄に個数を入力" />
        <Step n="3" text="青い「📦補充」ボタンをタップ" />
        <Note text="在庫が増え、記録に残ります" />
      </Section>

      {/* ⑤ 半値買取 */}
      <Section num="⑤" title="半値で買い取る時">
        <Step n="1" text="対象の契約者詳細画面を開く" />
        <Step n="2" text="対象商品の「🏷️半値」ボタン左の入力欄に個数を入力" />
        <Step n="3" text="黄色の「🏷️半値」ボタンをタップ" />
        <Step n="4" text="確認ダイアログで「OK」をタップ" />
        <Note text="商品価格の半額 × 個数が月末精算に含まれます" />
      </Section>

      {/* ⑥ 仕入れ */}
      <Section num="⑥" title="仕入れとして買い取る時">
        <Step n="1" text="対象の契約者詳細画面を開く" />
        <Step n="2" text="対象商品の「🛒仕入」ボタン左の入力欄に個数を入力" />
        <Step n="3" text="紫の「🛒仕入」ボタンをタップ" />
        <Step n="4" text="確認ダイアログで「OK」をタップ" />
        <Note text="商品の定価 × 個数が月末精算に含まれます" />
      </Section>

      {/* ⑦ 月末精算 */}
      <Section num="⑦" title="月末に精算レポートを送る">
        <Step n="1" text="トップ画面の「月末レポート送信」ボタンをタップ" />
        <Step n="2" text="確認ダイアログで「OK」をタップ" />
        <Step n="3" text="全契約者のLINEグループに今月の精算内容が自動送信されます" />
        <Note text="販売・半値買取・仕入れの合計金額がまとめて届きます" />
        <Note text="詳細な売上報告書のURLも一緒に送られます" />
      </Section>

      {/* ⑧ 契約者名の修正 */}
      <Section num="⑧" title="契約者名を修正する">
        <Step n="1" text="対象の契約者詳細画面を開く" />
        <Step n="2" text="名前の横の「✏️ 編集」ボタンをタップ" />
        <Step n="3" text="正しい名前を入力して「保存」をタップ" />
      </Section>

      {/* ⑨ 商品の削除 */}
      <Section num="⑨" title="商品を削除する">
        <Step n="1" text="対象の契約者詳細画面を開く" />
        <Step n="2" text="削除したい商品の🗑️ボタンをタップ" />
        <Step n="3" text="確認ダイアログで「OK」をタップ" />
        <Note text="削除すると元に戻せません。ご注意ください" warn />
      </Section>

      {/* 画面の見方 */}
      <div className="bg-white rounded-xl shadow p-4">
        <h2 className="font-bold text-gray-800 mb-3">🔍 画面の色の意味</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-6 rounded bg-green-400 shrink-0" />
            <span className="text-gray-700">在庫に余裕あり（3個以上）</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-6 rounded bg-red-400 shrink-0" />
            <span className="text-gray-700">在庫が少ない（2個以下）⚠️ 補充依頼が自動送信されます</span>
          </div>
          <div className="flex items-center gap-3 mt-3 flex-wrap gap-y-2">
            {[
              { color: 'bg-blue-100 text-blue-700', label: '補充' },
              { color: 'bg-orange-100 text-orange-700', label: '販売' },
              { color: 'bg-yellow-100 text-yellow-700', label: '半値買取' },
              { color: 'bg-purple-100 text-purple-700', label: '仕入れ' },
            ].map(({ color, label }) => (
              <span key={label} className={`text-xs px-2 py-0.5 rounded-full font-bold ${color}`}>{label}</span>
            ))}
            <span className="text-xs text-gray-500">← 今月の記録に表示されるラベル</span>
          </div>
        </div>
      </div>

      <p className="text-xs text-center text-gray-400">ご不明な点はシステム担当までご連絡ください</p>
    </div>
  )
}

function Section({ num, title, children }: { num: string; title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl shadow p-4">
      <h2 className="font-bold text-gray-800 mb-3 flex items-center gap-2">
        <span className="bg-green-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">{num}</span>
        {title}
      </h2>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Step({ n, text }: { n: string; text: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="bg-gray-200 text-gray-600 text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold shrink-0 mt-0.5">{n}</span>
      <p className="text-sm text-gray-700">{text}</p>
    </div>
  )
}

function Note({ text, warn }: { text: string; warn?: boolean }) {
  return (
    <div className={`flex items-start gap-1 mt-1 ml-7 ${warn ? 'text-red-500' : 'text-gray-400'}`}>
      <span className="text-xs mt-0.5">{warn ? '⚠️' : '💡'}</span>
      <p className="text-xs">{text}</p>
    </div>
  )
}

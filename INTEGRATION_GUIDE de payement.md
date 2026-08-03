# Guide d'intégration — Hub de paiement EdoctorPaiement

Documentation pour intégrer le hub de paiement dans une application cliente
(CLARIDOC PRO, e-doctor, application tierce, etc.).

**Base URL :** `https://payment.edoctor-tim.com/api-v1`

---

## 1. Architecture

```
┌──────────────────┐   1. Crée paiement      ┌──────────────────┐
│                  │ ──────────────────────▶ │                  │
│  Application     │                          │  Hub de paiement │
│  cliente         │   2. Réponse + URL/ref   │  (payment.       │
│  (CLARIDOC PRO)  │ ◀──────────────────────  │   edoctor-tim)   │
│                  │                          │                  │
│                  │   3. Webhook signé       │                  │
│                  │ ◀──────────────────────  │                  │
└──────────────────┘                          └─────────┬────────┘
                                                        │
                                              4. Appel provider
                                                        ▼
                                              ┌──────────────────┐
                                              │  Stripe / MTN /  │
                                              │  Orange / CyberS │
                                              └──────────────────┘
```

L'application cliente n'interagit **jamais** directement avec les providers.
Le hub centralise toutes les intégrations et notifie l'application via webhook
signé lors de chaque changement de statut.

---

## 2. Mise en place initiale

### 2.1. Obtenir un ServiceToken

Un administrateur du hub crée un `ServiceToken` pour votre application via
le dashboard admin ou l'API :

```http
POST /api-v1/service-tokens/
Authorization: Bearer <admin_jwt>
Content-Type: application/json

{
  "service_name": "CLARIDOC PRO",
  "description": "Application de gestion documentaire",
  "can_create_payment": true,
  "can_create_withdrawal": false,
  "can_check_status": true,
  "can_list_payments": false,
  "webhook_url": "https://claridoc-pro.com/webhooks/payments/",
  "webhook_enabled": true
}
```

**Réponse (à conserver précieusement) :**

```json
{
  "id": "fb7f573a-2a6a-40b8-a580-c13602bd3acf",
  "service_name": "CLARIDOC PRO",
  "token": "hub_jC7vJ2czUxPYMFvPhpnK8FGcrJv74ekeb6aJr87kqzY",
  "webhook_secret": "whsec_jW1R75b3LUNxdUteJN0xCVuHEVLgb12UFjZrYYwTOo4",
  "webhook_url": "https://claridoc-pro.com/webhooks/payments/",
  "webhook_enabled": true
}
```

- **`token`** : à mettre dans le header `Authorization: HubToken <token>` de toutes les requêtes
- **`webhook_secret`** : sert à vérifier la signature des webhooks reçus

### 2.2. Variables d'environnement côté client

```env
EDOCTOR_HUB_URL=https://payment.edoctor-tim.com/api-v1
EDOCTOR_HUB_TOKEN=hub_jC7vJ2czUxPYMFvPhpnK8FGcrJv74ekeb6aJr87kqzY
EDOCTOR_HUB_WEBHOOK_SECRET=whsec_jW1R75b3LUNxdUteJN0xCVuHEVLgb12UFjZrYYwTOo4
```

---

## 3. Authentification

Toutes les requêtes au hub utilisent le header :

```http
Authorization: HubToken hub_jC7vJ2czUxPYMFvPhpnK8FGcrJv74ekeb6aJr87kqzY
```

⚠️ **Ce n'est pas `Bearer`** mais bien `HubToken`. Le préfixe est obligatoire.

---

## 4. Créer un paiement

```http
POST /api-v1/paiement/
Authorization: HubToken <token>
Content-Type: application/json

{
  "amount": 1500,
  "currency": "XAF",
  "provider_id": "2",
  "module_origin": "abonnement_premium",
  "reference": "CLARIDOC-INV-2025-001",
  "telephone": "237691234567",
  "external_user_id": "user_42",
  "description": "Abonnement premium mensuel"
}
```

### Champs

| Champ | Type | Obligatoire | Description |
|-------|------|-------------|-------------|
| `amount` | number | ✅ | Montant à payer |
| `currency` | string | ✅ | `XAF`, `EUR`, `USD` (selon provider) |
| `provider_id` | string | ✅ | `"1"` Orange, `"2"` MTN, `"3"` Cybersource, ou nom `"STRIPE"` |
| `module_origin` | string | ✅ | Identifiant interne (ex: `"abonnement"`, `"facturation"`) |
| `reference` | string | ✅ | Référence unique côté votre app (servira pour retrouver le paiement) |
| `telephone` | string | selon provider | Format `2376XXXXXXXX` pour MTN/Orange |
| `external_user_id` | string | recommandé | ID de votre utilisateur (renvoyé dans le webhook) |
| `description` | string | optionnel | Description libre |

### Réponse par provider

**Stripe (`provider_id: "STRIPE"`)**
```json
{
  "checkout_url": "https://checkout.stripe.com/c/pay/cs_...",
  "sessionId": "cs_test_..."
}
```
→ Rediriger l'utilisateur vers `checkout_url`.

**MTN MoMo (`provider_id: "2"`)**
```json
{
  "momo_reference_id": { "referenceId": "CLARIDOC-INV-2025-001" },
  "status": "pending_momo_validation"
}
```
→ L'utilisateur reçoit une notification sur son téléphone pour valider.

**Orange Money (`provider_id: "1"`)**
```json
{
  "data": {
    "payToken": "MP1234...",
    "payment_url": "https://webpayment.orange.cm/...",
    "notif_token": "..."
  }
}
```
→ Rediriger vers `payment_url` ou utiliser le SDK Orange.

**Cybersource (`provider_id: "3"`)**
Retourne directement une page HTML auto-soumise vers Cybersource. À utiliser
dans une iframe ou un `<form>` POST côté frontend.

---

## 5. Vérifier le statut d'un paiement

### 5.1. Statut local (rapide)

```http
GET /api-v1/paiement/?search=CLARIDOC-INV-2025-001
Authorization: HubToken <token>
```

Retourne les paiements correspondants avec leur `status` actuel en base.

### 5.2. Statut temps réel (interroge le provider)

```http
GET /api-v1/paiement/payment-status/?reference=CLARIDOC-INV-2025-001
Authorization: HubToken <token>
```

**Réponse :**
```json
{
  "reference": "CLARIDOC-INV-2025-001",
  "status": "success",
  "provider": "MTN MOMO",
  "provider_status": "SUCCESSFUL",
  "provider_details": { ... }
}
```

Cet endpoint :
- Interroge le provider en temps réel
- Met à jour le statut local si différent
- Crédite le compte si le paiement vient de réussir
- Déclenche un webhook si le statut change

Idéal pour vérifier ponctuellement ou en cas de doute (perte de webhook).

### Valeurs possibles de `status`

| Valeur | Signification |
|--------|---------------|
| `pending` | En attente de validation |
| `success` | Payé avec succès |
| `failed` | Échec |
| `cancelled` | Annulé par l'utilisateur |

---

## 6. Recevoir les webhooks (notifications de statut)

Dès qu'un paiement change de statut (callback provider ou poll), le hub
envoie un POST signé à `webhook_url`.

### 6.1. Headers reçus

```
Content-Type: application/json
X-Hub-Event: payment.status_changed
X-Hub-Delivery: <uuid_unique_par_livraison>
X-Hub-Timestamp: 1746547200
X-Hub-Signature-256: sha256=<hex_digest>
User-Agent: EdoctorPaiement-Hub/1.0
```

### 6.2. Body reçu

```json
{
  "event": "payment.status_changed",
  "timestamp": 1746547200,
  "data": {
    "payment_id": "...",
    "reference": "CLARIDOC-INV-2025-001",
    "status": "success",
    "amount": "1500.00",
    "currency": "XAF",
    "module_origin": "abonnement_premium",
    "external_user_id": "user_42",
    "external_user_phone": "237691234567",
    "provider": "MTN MOMO",
    "metadata": {}
  }
}
```

### 6.3. Vérification de signature (OBLIGATOIRE)

Le hub signe le payload avec HMAC-SHA256 en utilisant votre `webhook_secret`.
Vous **devez** vérifier cette signature côté serveur avant tout traitement.

**Algorithme :**
```
signed_payload = f"{timestamp}.{body_bytes}"
expected_signature = HMAC-SHA256(webhook_secret, signed_payload).hex()
header_value = "sha256=" + expected_signature
```

Refuser la requête si :
- Le timestamp est plus vieux que 5 minutes (anti-rejeu)
- La signature reçue ne correspond pas à celle calculée

### 6.4. Exemple Python / Django

```python
import hmac
import hashlib
import time
import os
import json
from django.http import HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

WEBHOOK_SECRET = os.environ["EDOCTOR_HUB_WEBHOOK_SECRET"]
MAX_AGE_SECONDS = 300


def verify_signature(secret, timestamp, body, received):
    try:
        ts = int(timestamp)
    except (TypeError, ValueError):
        return False
    if abs(time.time() - ts) > MAX_AGE_SECONDS:
        return False
    signed = f"{timestamp}.".encode() + body
    expected = "sha256=" + hmac.new(
        secret.encode(), signed, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, received or "")


@csrf_exempt
@require_POST
def edoctor_webhook(request):
    body = request.body
    sig = request.headers.get("X-Hub-Signature-256", "")
    ts = request.headers.get("X-Hub-Timestamp", "")

    if not verify_signature(WEBHOOK_SECRET, ts, body, sig):
        return HttpResponse("Invalid signature", status=401)

    payload = json.loads(body)
    event = payload["event"]
    data = payload["data"]

    if event == "payment.status_changed":
        # Mettre à jour votre base
        reference = data["reference"]
        status_value = data["status"]
        external_user_id = data["external_user_id"]
        # ... traitement métier ...

    return HttpResponse("OK", status=200)
```

### 6.5. Exemple Node.js / Express

```javascript
const crypto = require('crypto');
const express = require('express');
const app = express();

const WEBHOOK_SECRET = process.env.EDOCTOR_HUB_WEBHOOK_SECRET;
const MAX_AGE = 300;

function verifySignature(secret, ts, body, received) {
  const tsInt = parseInt(ts, 10);
  if (isNaN(tsInt)) return false;
  if (Math.abs(Date.now() / 1000 - tsInt) > MAX_AGE) return false;
  const signed = Buffer.concat([Buffer.from(`${ts}.`), body]);
  const expected = 'sha256=' + crypto
    .createHmac('sha256', secret)
    .update(signed)
    .digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(received || '')
  );
}

app.post(
  '/webhooks/payments',
  express.raw({ type: 'application/json' }),
  (req, res) => {
    const sig = req.header('X-Hub-Signature-256');
    const ts = req.header('X-Hub-Timestamp');

    if (!verifySignature(WEBHOOK_SECRET, ts, req.body, sig)) {
      return res.status(401).send('Invalid signature');
    }

    const payload = JSON.parse(req.body.toString());
    if (payload.event === 'payment.status_changed') {
      const { reference, status, external_user_id } = payload.data;
      // ... traitement métier ...
    }

    res.send('OK');
  }
);
```

### 6.6. Exemple PHP

```php
<?php
$secret = getenv('EDOCTOR_HUB_WEBHOOK_SECRET');
$body = file_get_contents('php://input');
$ts = $_SERVER['HTTP_X_HUB_TIMESTAMP'] ?? '';
$sig = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

if (abs(time() - (int)$ts) > 300) {
    http_response_code(401);
    exit('Timestamp expired');
}

$expected = 'sha256=' . hash_hmac('sha256', "{$ts}." . $body, $secret);
if (!hash_equals($expected, $sig)) {
    http_response_code(401);
    exit('Invalid signature');
}

$payload = json_decode($body, true);
if ($payload['event'] === 'payment.status_changed') {
    $reference = $payload['data']['reference'];
    $status = $payload['data']['status'];
    // ... traitement métier ...
}

http_response_code(200);
echo 'OK';
```

### 6.7. Retours HTTP attendus

| Code | Comportement du hub |
|------|---------------------|
| `2xx` | Livraison réussie, pas de retry |
| `4xx` | Échec définitif, retry quand même (max 5 fois) |
| `5xx` ou timeout | Retry avec backoff exponentiel (max 10 min entre tentatives, 5 essais) |

### 6.8. Idempotence

Le `X-Hub-Delivery` est unique par livraison. Stockez-le et ignorez les
livraisons déjà traitées (évite le double-traitement en cas de retry).

---

## 7. Rotation du webhook secret

En cas de fuite ou rotation périodique :

```http
POST /api-v1/service-tokens/{id}/rotate-webhook-secret/
Authorization: Bearer <admin_jwt>
```

**Réponse :**
```json
{
  "message": "Webhook secret rotated successfully.",
  "service_name": "CLARIDOC PRO",
  "webhook_secret": "whsec_NEW_SECRET_xxx"
}
```

⚠️ Coordonner la rotation : mettre à jour le `.env` de la plateforme cliente
**immédiatement** après l'appel, sinon les webhooks seront rejetés entre-temps.

---

## 8. Exemples d'intégration côté client

### 8.1. Création de paiement (Python / Django)

```python
import os
import requests

HUB_URL = os.environ["EDOCTOR_HUB_URL"]
HUB_TOKEN = os.environ["EDOCTOR_HUB_TOKEN"]


def create_payment(amount, reference, telephone, provider="2"):
    response = requests.post(
        f"{HUB_URL}/paiement/",
        headers={
            "Authorization": f"HubToken {HUB_TOKEN}",
            "Content-Type": "application/json",
        },
        json={
            "amount": amount,
            "currency": "XAF",
            "provider_id": provider,
            "module_origin": "abonnement_claridoc",
            "reference": reference,
            "telephone": telephone,
            "external_user_id": "user_42",
        },
        timeout=15,
    )
    response.raise_for_status()
    return response.json()
```

### 8.2. Vérification de statut (Python / Django)

```python
def check_payment(reference):
    response = requests.get(
        f"{HUB_URL}/paiement/payment-status/",
        headers={"Authorization": f"HubToken {HUB_TOKEN}"},
        params={"reference": reference},
        timeout=15,
    )
    response.raise_for_status()
    return response.json()["status"]
```

### 8.3. Création de paiement (Node.js)

```javascript
const axios = require('axios');

const hub = axios.create({
  baseURL: process.env.EDOCTOR_HUB_URL,
  headers: { Authorization: `HubToken ${process.env.EDOCTOR_HUB_TOKEN}` },
});

async function createPayment({ amount, reference, telephone, provider = "2" }) {
  const { data } = await hub.post('/paiement/', {
    amount,
    currency: 'XAF',
    provider_id: provider,
    module_origin: 'abonnement_claridoc',
    reference,
    telephone,
    external_user_id: 'user_42',
  });
  return data;
}
```

---

## 9. Codes d'erreur

| Code HTTP | Cas | Action |
|-----------|-----|--------|
| `400` | Paramètres manquants ou invalides | Vérifier le body |
| `401` | Token absent ou invalide | Vérifier le header `Authorization: HubToken ...` |
| `403` | Permission insuffisante sur le ServiceToken | Demander à l'admin de cocher la permission |
| `404` | Paiement / ressource introuvable | Vérifier la `reference` |
| `500` | Erreur interne provider | Réessayer plus tard |
| `502` | Provider externe injoignable | Réessayer ou vérifier via webhook |

---

## 10. Checklist d'intégration

- [ ] ServiceToken créé par l'admin du hub
- [ ] Variables `EDOCTOR_HUB_URL`, `EDOCTOR_HUB_TOKEN`, `EDOCTOR_HUB_WEBHOOK_SECRET` dans le `.env`
- [ ] Endpoint webhook créé et exposé en HTTPS
- [ ] `webhook_url` configuré dans le ServiceToken via PATCH
- [ ] `webhook_enabled: true` activé
- [ ] Signature HMAC-SHA256 vérifiée côté webhook
- [ ] Idempotence basée sur `X-Hub-Delivery` mise en place
- [ ] Reference unique par paiement (idéalement préfixée par votre app)
- [ ] Test bout-en-bout : créer un paiement → recevoir le webhook → vérifier la signature
- [ ] Fallback de polling via `/payment-status/` en cas de webhook perdu

---

## 11. Support et documentation

- **API interactive (Swagger) :** `https://payment.edoctor-tim.com/api-v1/swagger/`
- **ReDoc :** `https://payment.edoctor-tim.com/api-v1/redoc/`
- **Dashboard admin :** géré par l'équipe e-doctor
